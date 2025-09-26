import { Octokit } from "@octokit/rest";
import { GitHubUtils } from "../common/utils.js";
import type { FeatureImpactAnalyzerInputs } from "../common/types.js";

class McpReportGenerator {
  private repoUrl: string;
  private prNumber: number;
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor({ repoUrl, prNumber, githubToken }: FeatureImpactAnalyzerInputs) {
    this.repoUrl = repoUrl;
    this.prNumber = prNumber;
    this.octokit = GitHubUtils.createClient(githubToken);

    const { owner, repo } = GitHubUtils.parseRepoUrl(repoUrl);
    this.owner = owner;
    this.repo = repo;
  }

  // 대상 PR의 메터 데이터(제목, 작성자, 생성/머지 시각 등) 가져오기
  private async _fetchPRMetadata(owner: string, repo: string, pull_number: number) {
    const { data } = await this.octokit.pulls.get({ owner, repo, pull_number });
    return data;
  }

  // PR의 모든 커밋과 모든 변경 파일 목록을 페이징 처리로 수집
  private async _getGitDataForPR(owner: string, repo: string, prNumber: number) {
    const commits = await this.octokit.paginate(
      this.octokit.pulls.listCommits,
      { owner, repo, pull_number: prNumber, per_page: 100 }
    );

    const files = await this.octokit.paginate(
      this.octokit.pulls.listFiles,
      { owner, repo, pull_number: prNumber, per_page: 100 }
    );

    const prFilesAll = files.map(f => f.filename);

    // 분석에서 커밋별 파일 매칭이 꼭 필요 없다면, PR 전체 파일 세트를 커밋별로 동일 적용
    const commitsSimplified = commits.map(c => ({
      sha: c.sha,
      message: c.commit.message,
      authorDate: c.commit.author?.date ?? c.commit.committer?.date ?? "",
      changedFiles: prFilesAll,
    }));

    return { commits: commitsSimplified, files: prFilesAll };
  }

  // 커밋 개수로 규모 산출
  private _calculateScale(commits: any[]): number { return commits.length; }

  // 변경이 퍼진 정도를 상위 디렉터리 개수로 측정
  private _calculateDispersion(commits: any[]): number {
    const changedFiles = new Set<string>(commits.flatMap(c => c.changedFiles ?? []));
    const topLevelDirs = new Set(Array.from(changedFiles).map(f => f.split("/")[0]));
    return topLevelDirs.size;
  }

  // prefix가 "fix"로 시작하는 커밋 비율을 카오스(혼란도)로 측정
  private _calculateChaos(commits: any[]): number {
    const isFix = (msg: string) => msg?.trim().toLowerCase().startsWith("fix");
    const fixCount = commits.filter(c => isFix(c.message)).length;
    return commits.length ? (fixCount / commits.length) * 100 : 0; // %
  }

  // 첫 커밋(작성 시각)부터 PR 생성 시각까지의 격리 기간(일수)
  private _calculateIsolation(commits: any[], prMetadata: any): number {
    if (!commits?.length) return 0;
    const firstCommitDate = new Date(commits[commits.length - 1]?.authorDate);
    const prCreationDate = new Date(prMetadata.created_at);
    const ms = prCreationDate.getTime() - firstCommitDate.getTime();
    return ms > 0 ? ms / (1000 * 60 * 60 * 24) : 0; // days
  }

  // PR 생성부터 머지까지 걸린 시간(시간 단위)
  private _calculateLag(prMetadata: any): number {
    if (!prMetadata.merged_at) return 0;
    const createdAt = new Date(prMetadata.created_at).getTime();
    const mergedAt = new Date(prMetadata.merged_at).getTime();
    return (mergedAt - createdAt) / (1000 * 60 * 60); // hours
  }

  // 파일 간 동시 변경 관계의 네트워크 크기를 단순 지표로 산출
  private _calculateCoupling(commits: any[]): number {
    const co = new Map<string, Set<string>>();
    for (const c of commits) {
      const files = c.changedFiles ?? [];
      for (let i = 0; i < files.length; i++) {
        for (let j = i + 1; j < files.length; j++) {
          const a = files[i], b = files[j];
          if (!co.has(a)) co.set(a, new Set());
          if (!co.has(b)) co.set(b, new Set());
          co.get(a)!.add(b);
          co.get(b)!.add(a);
        }
      }
    }
    return co.size;
  }

  async generate() {
    const prMetadata = await this._fetchPRMetadata(this.owner, this.repo, this.prNumber);
    const { commits } = await this._getGitDataForPR(this.owner, this.repo, this.prNumber);

    const metrics = {
      scale: this._calculateScale(commits),
      dispersion: this._calculateDispersion(commits),
      chaos: this._calculateChaos(commits),
      isolation: this._calculateIsolation(commits, prMetadata),
      lag: this._calculateLag(prMetadata),
      coupling: this._calculateCoupling(commits),
    };

    return {
      prInfo: { repoUrl: this.repoUrl, prNumber: this.prNumber },
      metrics,
      prMetadata,
      commits,
    };
  }
}

export async function analyzeFeatureImpact(inputs: FeatureImpactAnalyzerInputs) {
  const { repoUrl, prNumber } = inputs;
  const rateScale = (v: number) => (v >= 20 ? "Very Large" : v >= 10 ? "Large" : v >= 5 ? "Medium" : "Small");
  const rateDispersion = (v: number) => (v >= 6 ? "Very High" : v >= 4 ? "High" : v >= 2 ? "Moderate" : "Low");
  const rateChaos = (r: number) => (r >= 0.5 ? "High" : r >= 0.25 ? "Moderate" : "Low");
  const rateIsolationDays = (d: number) => (d >= 14 ? "Long" : d >= 7 ? "Normal" : "Short");
  const rateReviewLagDays = (d: number) => (d >= 5 ? "Slow" : d >= 2 ? "Normal" : "Fast");

  const reportGenerator = new McpReportGenerator(inputs);
  const report = await reportGenerator.generate();
  const { metrics, prMetadata, commits } = report;

  const scale = Number(metrics.scale ?? 0);
  const dispersion = Number(metrics.dispersion ?? 0);
  const chaosRatio = Number(((metrics.chaos ?? 0) / 100).toFixed(2));        // % → ratio
  const isolationDays = Number(Number(metrics.isolation ?? 0).toFixed(1));    // days
  const reviewLagDays = Number(((Number(metrics.lag ?? 0) / 24)).toFixed(1)); // hours → days

  const changedFiles = Array.from(
    new Set((commits ?? []).flatMap((c: any) => c.changedFiles ?? []))
  );

  // 간단 heatmap: 경로 깊이 가중치 합산 → 상위 12개, 0~100 정규화
  const bucket = new Map<string, number>();
  for (const f of changedFiles) {
    const parts = f.split("/").filter(Boolean);
    for (let i = parts.length; i >= 1; i--) {
      const key = parts.slice(0, i).join("/");
      const w = i;
      bucket.set(key, (bucket.get(key) ?? 0) + w);
    }
  }
  const top = Array.from(bucket.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12);
  const max = top[0]?.[1] ?? 1;
  const heatmap = top.map(([path, score]) => ({
    path,
    impact_score: Math.round((score / max) * 100),
  }));

  return {
    metadata: { analysis_type: "feature_impact_analysis", pull_request_id: prNumber },
    pull_request_info: {
      title: prMetadata?.title ?? "",
      author: prMetadata?.user?.login ?? "",
      url: prMetadata?.html_url ?? repoUrl,
    },
    impact_metrics: {
      scale: { value: scale, unit: "commits", rating: rateScale(scale) },
      dispersion: { value: dispersion, unit: "modules", rating: rateDispersion(dispersion) },
      chaos: { value: chaosRatio, unit: "ratio", rating: rateChaos(chaosRatio) },
      isolation_period_days: { value: isolationDays, rating: rateIsolationDays(isolationDays) },
      review_lag_days: { value: reviewLagDays, rating: rateReviewLagDays(reviewLagDays) },
    },
    impact_heatmap_data: heatmap,
  };
}
