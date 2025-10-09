import type { ClusterNode } from "types";

import type { ReleaseContributorActivity } from "./FolderActivityFlow.type";

export interface ReleaseGroup {
  releaseTag: string;
  commitCount: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  commits: CommitData[];
}

export interface ReleaseFolderActivity {
  folderPath: string;
  releaseTag: string;
  totalChanges: number;
  insertions: number;
  deletions: number;
  commitCount: number;
  contributors: string[];
}

export interface CommitData {
  id: string;
  authorDate: string;
  commitDate: string;
  author: {
    id: string;
    names: string[];
    emails: string[];
  };
  diffStatistics: {
    insertions: number;
    deletions: number;
    files: { [filePath: string]: { insertions: number; deletions: number } };
  };
  releaseTags: string[];
}

/**
 * Extracts folder path at specified depth from file path.
 *
 * @param filePath - Full file path to extract from
 * @param depth - Folder depth level to extract (default: 1)
 * @returns Extracted folder path or "." for root level
 */
export function extractFolderFromPath(filePath: string, depth = 1): string {
  const parts = filePath.split("/");
  if (parts.length === 1) return ".";

  const folderParts = parts.slice(0, Math.min(depth, parts.length - 1));
  return folderParts.length > 0 ? folderParts.join("/") : ".";
}

/**
 * Groups commits by release tags.
 * Commits without release tags are merged into the previous release group.
 *
 * @param clusterNodeList - List of cluster nodes containing commits
 * @returns Array of release groups sorted chronologically
 */
export function groupCommitsByReleaseTags(clusterNodeList: ClusterNode[]): ReleaseGroup[] {
  const allCommits = clusterNodeList
    .flatMap((cluster) => cluster.commitNodeList.map((node) => node.commit))
    .sort((a, b) => new Date(a.commitDate).getTime() - new Date(b.commitDate).getTime());

  interface ReduceAccumulator {
    groups: ReleaseGroup[];
    lastGroup: ReleaseGroup | null;
  }

  const { groups } = allCommits.reduce<ReduceAccumulator>(
    (acc, commit) => {
      if (commit.releaseTags && commit.releaseTags.length > 0) {
        const newGroups = commit.releaseTags.map((releaseTag) => ({
          releaseTag,
          commitCount: 1,
          dateRange: {
            start: new Date(commit.commitDate),
            end: new Date(commit.commitDate),
          },
          commits: [commit],
        }));

        return {
          groups: [...acc.groups, ...newGroups],
          lastGroup: newGroups[newGroups.length - 1],
        };
      }

      if (acc.lastGroup) {
        const updatedLastGroup: ReleaseGroup = {
          ...acc.lastGroup,
          commits: [...acc.lastGroup.commits, commit],
          commitCount: acc.lastGroup.commitCount + 1,
          dateRange: {
            ...acc.lastGroup.dateRange,
            end: new Date(commit.commitDate),
          },
        };

        const updatedGroups = acc.groups.slice();
        updatedGroups[updatedGroups.length - 1] = updatedLastGroup;

        return {
          groups: updatedGroups,
          lastGroup: updatedLastGroup,
        };
      }

      const preReleaseGroup = {
        releaseTag: "Pre-release",
        commitCount: 1,
        dateRange: {
          start: new Date(commit.commitDate),
          end: new Date(commit.commitDate),
        },
        commits: [commit],
      };

      return {
        groups: [preReleaseGroup, ...acc.groups],
        lastGroup: preReleaseGroup,
      };
    },
    { groups: [], lastGroup: null }
  );

  return groups;
}

interface FolderStats {
  totalChanges: number;
  insertions: number;
  deletions: number;
  commitCount: number;
  contributors: Set<string>;
}

/**
 * Analyzes folder activity per release group.
 *
 * @param releaseGroups - Release groups to analyze
 * @param folderDepth - Folder depth level for grouping (default: 1)
 * @returns Array of folder activities per release
 */
export function analyzeReleaseFolderActivity(releaseGroups: ReleaseGroup[], folderDepth = 1): ReleaseFolderActivity[] {
  const activities: ReleaseFolderActivity[] = [];

  releaseGroups.forEach((group) => {
    const folderStats = new Map<string, FolderStats>();

    group.commits.forEach((commit) => {
      const authorName = commit.author.names[0] || "Unknown";

      Object.entries(commit.diffStatistics.files).forEach(([filePath, stats]) => {
        const folderPath = extractFolderFromPath(filePath, folderDepth);

        if (!folderStats.has(folderPath)) {
          folderStats.set(folderPath, {
            totalChanges: 0,
            insertions: 0,
            deletions: 0,
            commitCount: 0,
            contributors: new Set(),
          });
        }

        const folderActivity = folderStats.get(folderPath);
        if (folderActivity) {
          folderActivity.insertions += stats.insertions;
          folderActivity.deletions += stats.deletions;
          folderActivity.totalChanges += stats.insertions + stats.deletions;
          folderActivity.contributors.add(authorName);
        }
      });
    });

    group.commits.forEach((commit) => {
      const foldersInCommit = new Set<string>();
      Object.keys(commit.diffStatistics.files).forEach((filePath) => {
        const folderPath = extractFolderFromPath(filePath, folderDepth);
        foldersInCommit.add(folderPath);
      });

      foldersInCommit.forEach((folderPath) => {
        const folder = folderStats.get(folderPath);
        if (folder) {
          folder.commitCount += 1;
        }
      });
    });

    folderStats.forEach((stats, folderPath) => {
      activities.push({
        folderPath,
        releaseTag: group.releaseTag,
        totalChanges: stats.totalChanges,
        insertions: stats.insertions,
        deletions: stats.deletions,
        commitCount: stats.commitCount,
        contributors: Array.from(stats.contributors),
      });
    });
  });

  return activities;
}

/**
 * Extracts top folders by activity across releases.
 *
 * @param clusterNodeList - List of cluster nodes containing commits
 * @param count - Number of top folders to return (default: 8)
 * @param folderDepth - Folder depth level for grouping (default: 1)
 * @returns Object containing release groups, filtered activities, and top folders
 */
export function getTopFoldersByRelease(
  clusterNodeList: ClusterNode[],
  count = 8,
  folderDepth = 1
): {
  releaseGroups: ReleaseGroup[];
  folderActivities: ReleaseFolderActivity[];
  topFolders: string[];
} {
  const releaseGroups = groupCommitsByReleaseTags(clusterNodeList);
  const folderActivities = analyzeReleaseFolderActivity(releaseGroups, folderDepth);

  const globalFolderStats = new Map<string, number>();
  folderActivities.forEach((activity) => {
    const current = globalFolderStats.get(activity.folderPath) || 0;
    globalFolderStats.set(activity.folderPath, current + activity.totalChanges);
  });

  const topFolders = Array.from(globalFolderStats.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([folderPath]) => folderPath);

  return {
    releaseGroups,
    folderActivities: folderActivities.filter((activity) => topFolders.includes(activity.folderPath)),
    topFolders,
  };
}

interface ContributorFolderStats {
  changes: number;
  insertions: number;
  deletions: number;
  lastDate: Date;
}

/**
 * Extracts contributor activities for specific release groups.
 *
 * @param releaseGroups - Release groups to analyze
 * @param topFolders - List of folder paths to include
 * @param folderDepth - Folder depth level for grouping (default: 1)
 * @returns Array of contributor activities per folder and release
 */
export function extractReleaseContributorActivities(
  releaseGroups: ReleaseGroup[],
  topFolders: string[],
  folderDepth = 1
): ReleaseContributorActivity[] {
  const activities: ReleaseContributorActivity[] = [];

  releaseGroups.forEach((group, releaseIndex) => {
    const contributorFolderStats = new Map<string, Map<string, ContributorFolderStats>>();

    group.commits.forEach((commit) => {
      const authorName = commit.author.names[0] || "Unknown";
      const commitDate = new Date(commit.commitDate);

      if (!contributorFolderStats.has(authorName)) {
        contributorFolderStats.set(authorName, new Map());
      }

      const contributorStats = contributorFolderStats.get(authorName);
      if (!contributorStats) return;

      Object.entries(commit.diffStatistics.files).forEach(([filePath, stats]) => {
        const folderPath = extractFolderFromPath(filePath, folderDepth);

        if (!topFolders.includes(folderPath)) return;

        if (!contributorStats.has(folderPath)) {
          contributorStats.set(folderPath, {
            changes: 0,
            insertions: 0,
            deletions: 0,
            lastDate: commitDate,
          });
        }

        const folderStats = contributorStats.get(folderPath);
        if (folderStats) {
          folderStats.changes += stats.insertions + stats.deletions;
          folderStats.insertions += stats.insertions;
          folderStats.deletions += stats.deletions;
          folderStats.lastDate = commitDate;
        }
      });
    });

    contributorFolderStats.forEach((folderStatsMap, contributorName) => {
      folderStatsMap.forEach((stats, folderPath) => {
        activities.push({
          contributorName,
          folderPath,
          releaseTag: group.releaseTag,
          releaseIndex,
          changes: stats.changes,
          insertions: stats.insertions,
          deletions: stats.deletions,
          date: stats.lastDate,
        });
      });
    });
  });

  return activities;
}
