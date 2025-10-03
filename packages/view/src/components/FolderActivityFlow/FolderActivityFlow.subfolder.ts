import type { ClusterNode } from "types";
import type { FolderActivity } from "./FolderActivityFlow.analyzer";

export function getSubFolders(totalData: ClusterNode[], parentPath: string): FolderActivity[] {
  if (totalData.length === 0) return [];

  const subFolderStats = new Map<string, FolderActivity>();

  totalData.forEach(cluster => {
    cluster.commitNodeList.forEach(commitNode => {
      const commit = commitNode.commit;

      Object.entries(commit.diffStatistics.files)
        .filter(([filePath]) => parentPath === "" || filePath.startsWith(parentPath + "/"))
        .forEach(([filePath, stats]) => {
          const relativePath = parentPath === "" ? filePath : filePath.substring(parentPath.length + 1);
          const pathParts = relativePath.split('/');
          const subPath = pathParts[0];

          if (subPath && subPath !== '.' && subPath !== '') {
            const fullPath = parentPath === "" ? subPath : `${parentPath}/${subPath}`;

            if (!subFolderStats.has(fullPath)) {
              subFolderStats.set(fullPath, {
                folderPath: fullPath,
                totalChanges: 0,
                insertions: 0,
                deletions: 0,
                commitCount: 0
              });
            }

            const folderActivity = subFolderStats.get(fullPath)!;
            folderActivity.insertions += stats.insertions;
            folderActivity.deletions += stats.deletions;
            folderActivity.totalChanges += stats.insertions + stats.deletions;
          }
        });
    });
  });

  return Array.from(subFolderStats.values())
    .sort((a, b) => b.totalChanges - a.totalChanges)
    .slice(0, 8);
}

/**
 * Release mode용 서브폴더 추출 함수
 * parentPath 기준으로 하위 폴더들을 추출하고 변경사항 기준으로 정렬
 */
export function getReleaseSubFolders(totalData: ClusterNode[], parentPath: string): string[] {
  if (totalData.length === 0) return [];

  const subFolderStats = new Map<string, number>();

  totalData.forEach(cluster => {
    cluster.commitNodeList.forEach(commitNode => {
      const commit = commitNode.commit;

      Object.entries(commit.diffStatistics.files)
        .filter(([filePath]) => parentPath === "" || filePath.startsWith(parentPath + "/"))
        .forEach(([filePath, stats]) => {
          const relativePath = parentPath === "" ? filePath : filePath.substring(parentPath.length + 1);
          const pathParts = relativePath.split('/');
          const subPath = pathParts[0];

          if (subPath && subPath !== '.' && subPath !== '') {
            const fullPath = parentPath === "" ? subPath : `${parentPath}/${subPath}`;

            const currentChanges = subFolderStats.get(fullPath) || 0;
            subFolderStats.set(fullPath, currentChanges + stats.insertions + stats.deletions);
          }
        });
    });
  });

  return Array.from(subFolderStats.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([folderPath]) => folderPath);
}