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