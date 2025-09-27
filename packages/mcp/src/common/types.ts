/**
 * 공통 GitHub 관련 타입 정의
 */

export interface GitHubRepoInfo {
  owner: string;
  repo: string;
}

export interface GitHubApiInputs {
  repoUrl?: string;
  repoPath?: string;
  githubToken: string;
}

/**
 * Feature Impact Analyzer 관련 타입
 */
export interface FeatureImpactAnalyzerInputs {
  repoUrl: string;
  prNumber: number;
  githubToken: string;
}

/**
 * Contributor Recommender 관련 타입
 */
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
 * 공통 GitHub API 응답 타입들
 */
export interface CommitInfo {
  sha: string;
  message: string;
  authorDate: string;
  changedFiles: string[];
}

export interface FileChangeInfo {
  filename: string;
  additions?: number;
  deletions?: number;
  changes?: number;
}
