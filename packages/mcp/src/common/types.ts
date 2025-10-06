export interface GitHubRepoInfo {
  owner: string;
  repo: string;
}

export interface GitHubApiInputs {
  repoUrl?: string;
  repoPath?: string;
  githubToken: string;
}

export interface FeatureImpactAnalyzerInputs {
  repoUrl: string;
  prNumber: number;
  githubToken: string;
  locale?: string;
}
export interface ContributorRecommenderInputs {
  repoPath: string;
  pr?: string | number;
  paths?: string[];
  branch?: string;
  since?: string;
  until?: string;
  githubToken: string;
  locale?: string;
  chart?: boolean;
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

export interface CSMDictGeneratorInputs {
  repo: string;
  githubToken: string;
  baseBranchName?: string;
  locale?: string;
  debug?: boolean;
}

export interface AnalysisResult {
  isPRSuccess: boolean;
  csmDict: Record<string, unknown[]>;
}

export interface CSMDictResult {
  success: boolean;
  data: {
    repository: GitHubRepoInfo & { url: string };
    analysis: {
      baseBranch: string;
      isPRDataAvailable: boolean;
      branches: string[];
      totalClusters: number;
      csmDict: Record<string, unknown[]>;
    };
  };
  metadata: {
    analyzedAt: string;
    commitsProcessed: number;
    debugMode: boolean;
    version?: string;
  };
}

// React Component Test Types
export interface ReactComponentTestInputs {
  complexity?: "simple" | "medium" | "complex" | "all";
  componentType?: "basic" | "chart" | "form" | "data-display" | "interactive";
}

export interface ReactComponentDefinition {
  title: string;
  description: string;
  component: string;
  usage: string;
}

export interface ReactComponentTestResult {
  components: ReactComponentDefinition[];
  testQuestions: string[];
}

// Data-driven React Component Types
export interface DataDrivenComponentInputs {
  dataType?: "chart" | "table" | "list" | "card" | "all";
  sampleData?: boolean;
}

export interface DataDrivenComponentDefinition {
  title: string;
  description: string;
  component: string;
  usage: string;
  sampleData: any;
  dataStructure: string;
}

export interface DataDrivenComponentResult {
  components: DataDrivenComponentDefinition[];
  testQuestions: string[];
}
