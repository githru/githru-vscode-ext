import { Octokit } from "@octokit/rest";

export interface ContributorRecommenderInputs {
  repoPath: string;
  pr?: string | number;
  paths?: string[];
  branch?: string;
  since?: string;
  until?: string;
  githubToken: string;
}

export interface ContributorCandidate {
  name: string;
  score: number;
  signals: {
    ownership: number;
    recentCommits: number;
    recentReviews: number;
  };
}

export interface ContributorRecommendation {
  candidates: ContributorCandidate[];
  notes: string[];
}

/**
 * 특정 파일/브랜치/PR에 대한 최적 기여자를 추천하는 분석기
 */
class ContributorRecommender {
  private octokit: Octokit;
  private owner: string;
  private repo: string;
  private pr?: string | number;
  private paths?: string[];
  private branch?: string;
  private since: string;
  private until: string;

  constructor(inputs: ContributorRecommenderInputs) {
    this.octokit = new Octokit({ auth: inputs.githubToken });
    
    // Repository URL 파싱
    const cleaned = inputs.repoPath
      .replace(/^https?:\/\/github\.com\//, "")
      .replace(/\.git$/, "")
      .replace(/\/+$/, "");
    const [owner, repo] = cleaned.split("/");
    this.owner = owner;
    this.repo = repo;
    
    this.pr = inputs.pr;
    this.paths = inputs.paths;
    this.branch = inputs.branch;
    
    // 시간 범위 파싱
    const timeRange = this.parseTimeRange(inputs.since, inputs.until);
    this.since = timeRange.since;
    this.until = timeRange.until;
  }

  /**
   * 날짜 파싱 유틸리티
   */
  private parseTimeRange(since?: string, until?: string) {
    const now = new Date();
    
    // since 파싱
    let sinceDate: Date;
    if (!since) {
      // 기본값: 90일 전
      sinceDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (since.endsWith('d')) {
      // "30d" 형태
      const days = parseInt(since.replace('d', ''));
      sinceDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    } else {
      // ISO 날짜 형태
      sinceDate = new Date(since);
    }

    // until 파싱
    let untilDate: Date = now;
    if (until) {
      untilDate = new Date(until);
    }

    return {
      since: sinceDate.toISOString(),
      until: untilDate.toISOString(),
    };
  }

  /**
   * PR 기반 기여자 추천
   */
  private async analyzePRContributors(): Promise<ContributorCandidate[]> {
    if (!this.pr) return [];

    const prNumber = typeof this.pr === 'string' ? parseInt(this.pr) : this.pr;
    
    try {
      // PR 파일 목록 가져오기
      const prFiles = await this.octokit.paginate(
        this.octokit.pulls.listFiles,
        { owner: this.owner, repo: this.repo, pull_number: prNumber, per_page: 100 }
      );

      const changedFiles = prFiles.map((file: any) => file.filename);
      return this.analyzeFileContributors(changedFiles);
    } catch (error: any) {
      console.error('PR 분석 중 오류:', error?.message);
      return [];
    }
  }

  /**
   * 파일 경로 기반 기여자 추천
   */
  private async analyzePathContributors(): Promise<ContributorCandidate[]> {
    if (!this.paths?.length) return [];
    
    // 각 경로별로 최근 커밋들을 수집
    const allContributors = new Map<string, { commits: number; files: Set<string> }>();

    for (const path of this.paths) {
      try {
        const commits = await this.octokit.paginate(
          this.octokit.repos.listCommits,
          {
            owner: this.owner,
            repo: this.repo,
            path,
            since: this.since,
            until: this.until,
            per_page: 100,
            ...(this.branch && { sha: this.branch }),
          }
        );

        // 각 커밋의 기여자 정보를 집계
        for (const commit of commits) {
          const author = (commit as any).author?.login;
          if (!author) continue;

          if (!allContributors.has(author)) {
            allContributors.set(author, { commits: 0, files: new Set() });
          }

          const contributor = allContributors.get(author)!;
          contributor.commits++;
          contributor.files.add(path);
        }
      } catch (error: any) {
        console.warn(`경로 ${path} 분석 중 오류:`, error?.message);
      }
    }

    return this.calculateContributorScores(allContributors);
  }

  /**
   * 브랜치 기반 기여자 추천
   */
  private async analyzeBranchContributors(): Promise<ContributorCandidate[]> {
    try {
      const commits = await this.octokit.paginate(
        this.octokit.repos.listCommits,
        {
          owner: this.owner,
          repo: this.repo,
          since: this.since,
          until: this.until,
          sha: this.branch || 'main',
          per_page: 100,
        }
      );

      const contributors = new Map<string, { commits: number; files: Set<string> }>();

      // 최신 50개 커밋만 분석 (성능을 위해)
      const recentCommits = commits.slice(0, 50);

      for (const commit of recentCommits) {
        const author = (commit as any).author?.login;
        if (!author) continue;

        if (!contributors.has(author)) {
          contributors.set(author, { commits: 0, files: new Set() });
        }

        const contributor = contributors.get(author)!;
        contributor.commits++;
        
        // 간단한 파일 정보 (실제로는 커밋 상세 정보가 필요하지만 성능상 생략)
        contributor.files.add('*');
      }

      return this.calculateContributorScores(contributors);
    } catch (error: any) {
      console.error('브랜치 분석 중 오류:', error?.message);
      return [];
    }
  }

  /**
   * 특정 파일들에 대한 기여자 분석
   */
  private async analyzeFileContributors(files: string[]): Promise<ContributorCandidate[]> {
    const contributors = new Map<string, { commits: number; files: Set<string> }>();

    // 각 파일에 대해 최근 커밋 기록 분석 (최대 10개 파일만)
    for (const file of files.slice(0, 10)) {
      try {
        const commits = await this.octokit.paginate(
          this.octokit.repos.listCommits,
          {
            owner: this.owner,
            repo: this.repo,
            path: file,
            since: this.since,
            until: this.until,
            per_page: 100,
          }
        );

        for (const commit of commits) {
          const author = (commit as any).author?.login;
          if (!author) continue;

          if (!contributors.has(author)) {
            contributors.set(author, { commits: 0, files: new Set() });
          }

          const contributor = contributors.get(author)!;
          contributor.commits++;
          contributor.files.add(file);
        }
      } catch (error: any) {
        console.warn(`파일 ${file} 분석 중 오류:`, error?.message);
      }
    }

    return this.calculateContributorScores(contributors);
  }

  /**
   * 기여자 점수 계산
   */
  private calculateContributorScores(
    contributors: Map<string, { commits: number; files: Set<string> }>
  ): ContributorCandidate[] {
    const totalCommits = Array.from(contributors.values()).reduce((sum, c) => sum + c.commits, 0);
    const maxFiles = Math.max(...Array.from(contributors.values()).map(c => c.files.size));

    return Array.from(contributors.entries())
      .map(([name, data]) => {
        // ownership: 파일 개수 기반 (정규화)
        const ownership = maxFiles > 0 ? data.files.size / maxFiles : 0;
        
        // 전체 점수 계산 (가중 평균)
        const commitScore = totalCommits > 0 ? data.commits / totalCommits : 0;
        const score = (commitScore * 0.6) + (ownership * 0.4);

        return {
          name,
          score: Number(score.toFixed(2)),
          signals: {
            ownership: Number(ownership.toFixed(2)),
            recentCommits: data.commits,
            recentReviews: 0, // TODO: 리뷰 데이터 연동
          },
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // 상위 10명만 반환
  }

  /**
   * 메인 분석 실행
   */
  async analyze(): Promise<ContributorRecommendation> {
    let candidates: ContributorCandidate[] = [];
    const notes: string[] = [];

    // 분석 조건에 따른 기여자 추천
    if (this.pr) {
      candidates = await this.analyzePRContributors();
      notes.push(`PR #${this.pr} 기반 추천`);
    } else if (this.paths?.length) {
      candidates = await this.analyzePathContributors();
      notes.push(`경로 기반 추천: ${this.paths.join(', ')}`);
    } else {
      candidates = await this.analyzeBranchContributors();
      notes.push(`브랜치 기반 추천: ${this.branch || 'main'}`);
    }

    // 기간 정보 추가
    const sinceDays = Math.ceil((new Date().getTime() - new Date(this.since).getTime()) / (1000 * 60 * 60 * 24));
    notes.push(`분석 기간: ${sinceDays}일`);

    return {
      candidates,
      notes,
    };
  }
}

export async function recommendContributors(inputs: ContributorRecommenderInputs): Promise<ContributorRecommendation> {
  const recommender = new ContributorRecommender(inputs);
  return recommender.analyze();
}
