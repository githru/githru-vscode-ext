import type { ClusterNode } from "types";

import type { FolderActivity } from "./FolderActivityFlow.analyzer";

/**
 * Extract subfolders for cluster mode navigation
 *
 * @param totalData - Array of cluster nodes containing commit data
 * @param parentPath - Parent folder path to extract subfolders from (empty string for root)
 * @returns Array of folder activities sorted by total changes (max 8 items)
 *
 * @example
 * ```ts
 * const subFolders = getSubFolders(clusterData, "src/components");
 * // Returns: [{ folderPath: "src/components/FolderActivityFlow", totalChanges: 150, ... }, ...]
 * ```
 */
export function getSubFolders(totalData: ClusterNode[], parentPath: string): FolderActivity[] {
  if (totalData.length === 0) return [];

  const subFolderStats = new Map<string, FolderActivity>();

  totalData.forEach((cluster) => {
    cluster.commitNodeList.forEach((commitNode) => {
      const { commit } = commitNode;

      Object.entries(commit.diffStatistics.files)
        .filter(([filePath]) => parentPath === "" || filePath.startsWith(`${parentPath}/`))
        .forEach(([filePath, stats]) => {
          const relativePath = parentPath === "" ? filePath : filePath.substring(parentPath.length + 1);
          const pathParts = relativePath.split("/");
          const subPath = pathParts[0];

          if (subPath && subPath !== "." && subPath !== "") {
            const fullPath = parentPath === "" ? subPath : `${parentPath}/${subPath}`;

            if (!subFolderStats.has(fullPath)) {
              subFolderStats.set(fullPath, {
                folderPath: fullPath,
                totalChanges: 0,
                insertions: 0,
                deletions: 0,
                commitCount: 0,
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
 * Extract subfolders for release mode navigation
 *
 * @param totalData - Array of cluster nodes containing commit data
 * @param parentPath - Parent folder path to extract subfolders from (empty string for root)
 * @returns Array of folder paths sorted by total changes (max 8 items)
 *
 * @example
 * ```ts
 * const releaseFolders = getReleaseSubFolders(clusterData, "src");
 * // Returns: ["src/components", "src/utils", "src/store", ...]
 * ```
 */
export function getReleaseSubFolders(totalData: ClusterNode[], parentPath: string): string[] {
  if (totalData.length === 0) return [];

  const subFolderStats = new Map<string, number>();

  totalData.forEach((cluster) => {
    cluster.commitNodeList.forEach((commitNode) => {
      const { commit } = commitNode;

      Object.entries(commit.diffStatistics.files)
        .filter(([filePath]) => parentPath === "" || filePath.startsWith(`${parentPath}/`))
        .forEach(([filePath, stats]) => {
          const relativePath = parentPath === "" ? filePath : filePath.substring(parentPath.length + 1);
          const pathParts = relativePath.split("/");
          const subPath = pathParts[0];

          if (subPath && subPath !== "." && subPath !== "") {
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
