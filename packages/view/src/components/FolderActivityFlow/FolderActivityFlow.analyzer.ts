import type { ClusterNode } from "types";

export interface FolderActivity {
  folderPath: string;
  totalChanges: number;
  insertions: number;
  deletions: number;
  commitCount: number;
}

export interface CommitData {
  id: string;
  authorDate: string;
  commitDate: string;
  diffStatistics: {
    insertions: number;
    deletions: number;
    files: { [filePath: string]: { insertions: number; deletions: number } };
  };
}

export function extractFolderFromPath(filePath: string, depth: number = 1): string {
  const parts = filePath.split("/");
  if (parts.length === 1) return "."; // 루트 레벨 파일

  const folderParts = parts.slice(0, Math.min(depth, parts.length - 1));
  return folderParts.length > 0 ? folderParts.join("/") : ".";
}

export function analyzeFolderActivity(clusterNodeList: ClusterNode[], folderDepth: number = 1): FolderActivity[] {
  const folderStats = new Map<string, FolderActivity>();

  // 클러스터에서 모든 커밋 추출
  const allCommits: CommitData[] = [];
  clusterNodeList.forEach(cluster => {
    cluster.commitNodeList.forEach(commitNode => {
      allCommits.push(commitNode.commit);
    });
  });

  // 각 커밋의 파일 변경사항 분석
  allCommits.forEach(commit => {
    Object.entries(commit.diffStatistics.files).forEach(([filePath, stats]) => {
        const folderPath = extractFolderFromPath(filePath, folderDepth);

        if (!folderStats.has(folderPath)) {
          folderStats.set(folderPath, {
            folderPath,
            totalChanges: 0,
            insertions: 0,
            deletions: 0,
            commitCount: 0
          });
        }

        const folderActivity = folderStats.get(folderPath)!;
        folderActivity.insertions += stats.insertions;
        folderActivity.deletions += stats.deletions;
        folderActivity.totalChanges += stats.insertions + stats.deletions;
      });
  });

  // 폴더별 고유 커밋 수 계산
  allCommits.forEach(commit => {
    const foldersInCommit = new Set<string>();
    Object.keys(commit.diffStatistics.files).forEach(filePath => {
      const folderPath = extractFolderFromPath(filePath, folderDepth);
      foldersInCommit.add(folderPath);
    });

    foldersInCommit.forEach(folderPath => {
      if (folderStats.has(folderPath)) {
        folderStats.get(folderPath)!.commitCount++;
      }
    });
  });

  // 배열로 변환하고 총 활동량 기준 정렬
  return Array.from(folderStats.values())
    .sort((a, b) => b.totalChanges - a.totalChanges);
}

export function getTopFolders(clusterNodeList: ClusterNode[], count: number = 5, folderDepth: number = 1): FolderActivity[] {
  const allActivities = analyzeFolderActivity(clusterNodeList, folderDepth);
  return allActivities.slice(0, count);
}