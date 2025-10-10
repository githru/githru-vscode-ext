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
  locale?: string;
  isChart?: boolean;
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

export interface CSMDictGeneratorInputs {
  repo: string;
  githubToken: string;
  baseBranchName?: string;
  locale?: string;
}

export interface GitUser {
  name: string;
  email: string;
}

export interface DifferenceStatistic {
  totalInsertionCount: number;
  totalDeletionCount: number;
  fileDictionary: { [filePath: string]: { insertionCount: number; deletionCount: number } };
}

export interface CommitRaw {
  sequence: number;
  id: string;
  parents: string[];
  branches: string[];
  tags: string[];
  author: GitUser;
  authorDate: Date;
  committer: GitUser;
  committerDate: Date;
  message: string;
  differenceStatistic: DifferenceStatistic;
  commitMessageType: string;
}

export interface CommitNode {
  stemId?: string;
  commit: CommitRaw;
}

export interface CSMNode {
  base: CommitNode;
  source: CommitNode[];
}

export interface CSMDictionary {
  [branch: string]: CSMNode[];
}

export interface AnalysisResult {
  isPRSuccess: boolean;
  csmDict: CSMDictionary;
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
      csmDict: CSMDictionary;
    };
  };
  metadata: {
    analyzedAt: string;
    commitsProcessed: number;
    debugMode: boolean;
    version?: string;
  };
}

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

export interface AuthorWorkPatternArgs {
  repoPath: string;
  author: string;
  branch?: string;
  since?: string;
  until?: string;
  githubToken: string;
  locale?: "en" | "ko";
  chart?: boolean;
}

export interface AuthorWorkPatternPayload {
  repo: string;
  author: string;
  period: { from: string | null; to: string | null };
  branch: string;
  metrics: {
    commits: number;
    insertions: number;
    deletions: number;
    churn: number;
  };
  typeMix: Array<{ label: string; value: number }>;
  locale?: "en" | "ko";
}
