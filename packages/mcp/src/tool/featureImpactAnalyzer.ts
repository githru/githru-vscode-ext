import { Octokit } from "@octokit/rest";
import { GitHubUtils } from "../common/utils.js";
import { I18n } from "../common/i18n.js";
import type { FeatureImpactAnalyzerInputs } from "../common/types.js";

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const ret: R[] = new Array(items.length);
  let i = 0;
  const runners = new Array(Math.min(concurrency, items.length)).fill(0).map(async () => {
    while (true) {
      const idx = i++;
      if (idx >= items.length) break;
      ret[idx] = await worker(items[idx], idx);
    }
  });
  await Promise.all(runners);
  return ret;
}

async function retry<T>(fn: () => Promise<T>, tries = 3, baseMs = 500): Promise<T> {
  let lastErr: any;
  for (let i=0; i<tries; i++) {
    try { return await fn(); }
    catch (e:any) {
      lastErr = e;
      const ms = baseMs * Math.pow(2, i);
      await new Promise(r => setTimeout(r, ms));
    }
  }
  throw lastErr;
}

function percentiles(sorted: number[], ps = [0.05,0.25,0.5,0.75,0.95]) {
  const out: Record<string, number> = {};
  for (const p of ps) out[`p${Math.round(p*100)}`] = quantile(sorted, p);
  out.min = sorted[0] ?? NaN;
  out.max = sorted[sorted.length - 1] ?? NaN;
  out.mean = sorted.length ? sorted.reduce((a, b) => a + b, 0) / sorted.length : NaN;
  return out;
}

function histogram(sorted: number[]) {
  if (sorted.length < 2) return { bins: [] as number[], counts: [] as number[] };
  const q25 = quantile(sorted, 0.25);
  const q75 = quantile(sorted, 0.75);
  const iqr = q75 - q25 || 1e-9;
  const binWidth = (2 * iqr) / Math.cbrt(sorted.length);
  const min = sorted[0], max = sorted[sorted.length - 1];
  const rawBins = Math.max(1, Math.ceil((max - min) / binWidth));
  const binCount = Math.max(10, Math.min(rawBins, 80));
  const bw = (max - min) / binCount || 1;
  const bins = Array.from({ length: binCount }, (_, i) => min + i * bw);
  const counts = new Array(binCount).fill(0);
  for (const v of sorted) {
    let idx = Math.floor((v - min) / bw);
    if (idx >= binCount) idx = binCount - 1;
    if (idx < 0) idx = 0;
    counts[idx]++;
  }
  return { bins, counts };
}

function robustZScores(values: number[]) {
  const arr = values.filter(Number.isFinite);
  if (!arr.length) return [];
  const sorted = arr.slice().sort((a, b) => a - b);
  const med = quantile(sorted, 0.5);
  const absDevs = arr.map(v => Math.abs(v - med)).sort((a, b) => a - b);
  const mad = quantile(absDevs, 0.5) || 1e-9;
  return arr.map(v => (v - med) / (1.4826 * mad));
}

function quantile(sorted: number[], q: number) {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

function thresholdsP05P95(valuesOrSorted: number[], alreadySorted=false) {
  const arr = alreadySorted ? valuesOrSorted : valuesOrSorted.filter(Number.isFinite).slice().sort((a,b)=>a-b);
  return { p05: quantile(arr, 0.05), p95: quantile(arr, 0.95), n: arr.length };
}

function rateByP05P95(v: number, p05: number, p95: number) {
  if (!Number.isFinite(v) || !Number.isFinite(p05) || !Number.isFinite(p95)) return "Unknown" as const;
  if (v >= p95) return "High" as const;
  if (v <= p05) return "Low" as const;
  return "Normal" as const;
}

class McpReportGenerator {
  private repoUrl: string;
  private prNumber: number;
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor({ repoUrl, prNumber, githubToken, locale }: FeatureImpactAnalyzerInputs) {
    if (locale) {
      I18n.setLocale(locale);
    }
    this.repoUrl = repoUrl;
    this.prNumber = prNumber;
    this.octokit = GitHubUtils.createGitHubAPIClient(githubToken);

    const { owner, repo } = GitHubUtils.parseRepoUrl(repoUrl);
    this.owner = owner;
    this.repo = repo;
  }

  private async _fetchPRMetadata(owner: string, repo: string, pull_number: number) {
    const { data } = await this.octokit.pulls.get({ owner, repo, pull_number });
    return data;
  }

  private async _getGitDataForPR(owner: string, repo: string, prNumber: number) {
    const [commits, files] = await Promise.all([
      this.octokit.paginate(this.octokit.pulls.listCommits, {
        owner, repo, pull_number: prNumber, per_page: 100
      }),
      this.octokit.paginate(this.octokit.pulls.listFiles, {
        owner, repo, pull_number: prNumber, per_page: 100
      }),
    ]);

    const prFilesAll = files.map(f => f.filename);

    const commitsSimplified = commits.map(c => ({
      sha: c.sha,
      message: c.commit.message,
      authorDate: c.commit.author?.date ?? c.commit.committer?.date ?? "",
      changedFiles: prFilesAll,
    }));

    return { commits: commitsSimplified, files: prFilesAll };
  }

  private _calculateScale(commits: any[]): number { return commits.length; }

  private _calculateDispersion(commits: any[]): number {
    const changedFiles = new Set<string>(commits.flatMap(c => c.changedFiles ?? []));
    const topLevelDirs = new Set(Array.from(changedFiles).map(f => f.split("/")[0]));
    return topLevelDirs.size;
  }

  private _calculateChaos(commits: any[]): number {
    const isFix = (msg: string) => /\b(fix|hotfix|bugfix)\b/i.test(msg ?? "");
    const fixCount = commits.filter(c => isFix(c.message)).length;
    return commits.length ? (fixCount / commits.length) * 100 : 0;
  }

  private _calculateIsolation(commits: any[], prMetadata: any): number {
    if (!commits?.length) return 0;
    const tsList = commits
      .map(c => new Date(c.authorDate).getTime())
      .filter(n => Number.isFinite(n));
    if (!tsList.length) return 0;
    const firstCommitTs = Math.min(...tsList);
    const prCreationTs = new Date(prMetadata.created_at).getTime();
    const d = (prCreationTs - firstCommitTs) / (1000 * 60 * 60 * 24);
    return d > 0 ? d : 0;
  }

  private _calculateLag(prMetadata: any): number {
    if (!prMetadata.merged_at) return 0;
    const createdAt = new Date(prMetadata.created_at).getTime();
    const mergedAt = new Date(prMetadata.merged_at).getTime();
    const d = (mergedAt - createdAt) / (1000 * 60 * 60 * 24);
    return d > 0 ? d : 0;
  }

  private _calculateCoupling(commits: any[]): number {
    const allFiles = Array.from(new Set(commits.flatMap(c => c.changedFiles ?? [])));
    const N = allFiles.length;
    const MAX_FILES = 400;

    if (N > MAX_FILES) {
      const step = Math.ceil(N / MAX_FILES);
      const sampled = allFiles.filter((_, i) => i % step === 0);
      return this._pairCount(sampled.length);
    }
    return this._pairCount(N);
  }

  private _pairCount(n: number) {
    return (n * (n - 1)) / 2;
  }

  private _buildPathDistributionAndLongTail(files: string[], topN = 12) {
    const bucket = new Map<string, number>();
    for (const f of files) {
      if (!f) continue;
      const parts = f.split("/").filter(Boolean);
      let prefix = "";
      for (let i = 0; i < parts.length; i++) {
        prefix = prefix ? `${prefix}/${parts[i]}` : parts[i];
        const w = i + 1;
        bucket.set(prefix, (bucket.get(prefix) ?? 0) + w);
      }
    }

    const all = Array.from(bucket.entries());
    const scores = all.map(([, s]) => s);

    const top = all.slice().sort((a, b) => b[1] - a[1]).slice(0, topN);
    const max = top[0]?.[1] ?? 1;
    const pathHeatmapTop = top.map(([path, score]) => ({
      path,
      impact_score: Math.round((score / max) * 100),
      raw_score: score,
    }));

    const sortedScores = scores.slice().sort((a,b)=>a-b);
    const pathDistribution = {
      summary: percentiles(sortedScores),
      histogram: histogram(sortedScores),
    };

    const { p95 } = thresholdsP05P95(sortedScores, true);
    const zs = robustZScores(scores);

    const p95List = all
      .filter(([, s]) => Number.isFinite(p95) && s >= (p95 as number))
      .map(([path, score]) => ({ path, score, rule: "p95+" as const }));

    const madList = all
      .map(([path, score], i) => ({ path, score, z: Math.abs(zs[i] ?? 0) }))
      .filter(x => x.z >= 3)
      .map(({ path, score }) => ({ path, score, rule: "MAD|z>=3" as const }));

    const seen = new Set<string>();
    const pathLongTail = [...p95List, ...madList]
      .filter(x => (seen.has(x.path) ? false : (seen.add(x.path), true)))
      .sort((a, b) => b.score - a.score);

    return { pathHeatmapTop, pathDistribution, pathLongTail };
  }

  private async _collectHistoryMetrics(months = 6, limit = 200, concurrency = 8) {
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const picks: any[] = [];
    for await (const page of this.octokit.paginate.iterator(this.octokit.pulls.list, {
      owner: this.owner,
      repo: this.repo,
      state: "closed",
      sort: "updated",
      direction: "desc",
      per_page: 100,
    })) {
      for (const p of page.data) {
        if (p.merged_at && new Date(p.created_at) >= since) {
          picks.push(p);
          if (picks.length >= limit) break;
        }
      }
      if (picks.length >= limit) break;
    }

    const hist = await mapWithConcurrency(picks, concurrency, async (pr: any) => {
      const { commits } = await retry(
        () => this._getGitDataForPR(this.owner, this.repo, pr.number)
      );
      return {
        scale: this._calculateScale(commits),
        dispersion: this._calculateDispersion(commits),
        chaos: this._calculateChaos(commits),
        isolation: this._calculateIsolation(commits, { created_at: pr.created_at }),
        lag: this._calculateLag({ created_at: pr.created_at, merged_at: pr.merged_at }),
        coupling: this._calculateCoupling(commits),
      };
    });

    return hist;
  }

  private _rateWithP05P95(current: number, samples: number[]) {
    const { p05, p95, n } = thresholdsP05P95(samples);
    if (!Number.isFinite(p05) || !Number.isFinite(p95) || n < 20) {
      const sorted = samples.slice().sort((a, b) => a - b);
      const min = sorted[0], max = sorted[sorted.length - 1];
      if (!Number.isFinite(min) || !Number.isFinite(max)) return "Unknown" as const;
      if (current <= min) return "Low" as const;
      if (current >= max) return "High" as const;
      return "Normal" as const;
    }
    return rateByP05P95(current, p05, p95);
  }

  async generateWithOutlierRatings() {
    const prMetadata = await this._fetchPRMetadata(this.owner, this.repo, this.prNumber);

    const { commits, files } = await retry(
      () => this._getGitDataForPR(this.owner, this.repo, this.prNumber)
    );

    const metrics = {
      scale: this._calculateScale(commits),
      dispersion: this._calculateDispersion(commits),
      chaos: this._calculateChaos(commits),
      isolation: this._calculateIsolation(commits, prMetadata),
      lag: this._calculateLag(prMetadata),
      coupling: this._calculateCoupling(commits),
    };

    const hist = await this._collectHistoryMetrics(6, 200, 8);

    const rating = {
      scale: this._rateWithP05P95(metrics.scale, hist.map(h => h.scale)),
      dispersion: this._rateWithP05P95(metrics.dispersion, hist.map(h => h.dispersion)),
      chaos: this._rateWithP05P95(metrics.chaos, hist.map(h => h.chaos)),
      isolation: this._rateWithP05P95(metrics.isolation, hist.map(h => h.isolation)),
      lag: this._rateWithP05P95(metrics.lag, hist.map(h => h.lag)),
      coupling: this._rateWithP05P95(metrics.coupling, hist.map(h => h.coupling)),
    };

    const { pathHeatmapTop, pathDistribution, pathLongTail } =
      this._buildPathDistributionAndLongTail(files, 12);

    return {
      prInfo: { repoUrl: this.repoUrl, prNumber: this.prNumber },
      metrics,
      rating,
      prMetadata,
      pathHeatmapTop,
      pathDistribution,
      pathLongTail,
    };
  }
}

export async function analyzeFeatureImpact(inputs: FeatureImpactAnalyzerInputs) {
  const gen = new McpReportGenerator(inputs);
  return await gen.generateWithOutlierRatings();
}