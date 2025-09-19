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