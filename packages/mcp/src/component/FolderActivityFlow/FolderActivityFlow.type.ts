export interface ContributorActivity {
  contributorId: string;
  contributorName: string;
  date: Date;
  folderPath: string;
  changes: number;
  insertions: number;
  deletions: number;
  clusterId: string;
  clusterIndex: number;
}

export interface FlowLineData {
  startClusterIndex: number;
  startFolder: string;
  endClusterIndex: number;
  endFolder: string;
  contributorName: string;
}

export interface ReleaseContributorActivity {
  contributorName: string;
  folderPath: string;
  releaseTag: string;
  releaseIndex: number;
  changes: number;
  insertions: number;
  deletions: number;
  date: Date;
}

export interface ReleaseFlowLineData {
  startReleaseIndex: number;
  startFolder: string;
  endReleaseIndex: number;
  endFolder: string;
  contributorName: string;
}