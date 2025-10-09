import type { CommitRaw, CommitNode, CSMNode, CSMDictionary } from '@githru-vscode-ext/analysis-engine/dist/types';

export type CSMData = CSMDictionary;

export interface NodeBase {
  nodeTypeName: string;
}

export type ClusterNode = NodeBase & {
  commitNodeList: CommitNode[];
};

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
    files: {
      [filePath: string]: {
        insertions: number;
        deletions: number;
      };
    };
  };
  releaseTags: string[];
}

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

/**
 * 폴더 경로에서 지정된 깊이의 폴더를 추출
 */
export function extractFolderFromPath(filePath: string, depth = 1): string {
  const parts = filePath.split("/");
  if (parts.length === 1) return "."; // 루트 레벨 파일

  const folderParts = parts.slice(0, Math.min(depth, parts.length - 1));
  return folderParts.length > 0 ? folderParts.join("/") : ".";
}

/**
 * 커밋들을 releaseTags 기준으로 그룹화
 * releaseTags가 없는 커밋은 이전 releaseTags와 합침
 */
export function groupCommitsByReleaseTags(clusterNodeList: CommitData[]): ReleaseGroup[] {
  // 모든 커밋을 시간순으로 정렬
  const allCommits = [...clusterNodeList];
  allCommits.sort((a, b) => new Date(a.commitDate).getTime() - new Date(b.commitDate).getTime());

  const releaseGroups: ReleaseGroup[] = [];
  let currentGroup: ReleaseGroup | null = null;

  allCommits.forEach((commit) => {
    if (commit.releaseTags && commit.releaseTags.length > 0) {
      // 새로운 릴리즈 태그가 있는 경우, 새 그룹 시작
      commit.releaseTags.forEach((releaseTag) => {
        currentGroup = {
          releaseTag,
          commitCount: 1,
          dateRange: {
            start: new Date(commit.commitDate),
            end: new Date(commit.commitDate),
          },
          commits: [commit],
        };
        releaseGroups.push(currentGroup);
      });
    } else if (currentGroup) {
      // 기존 그룹에 추가
      currentGroup.commits.push(commit);
      currentGroup.commitCount += 1;
      currentGroup.dateRange.end = new Date(commit.commitDate);
    } else {
      // 첫 번째 릴리즈 태그 이전의 커밋들을 위한 그룹 생성
      currentGroup = {
        releaseTag: "Pre-release",
        commitCount: 1,
        dateRange: {
          start: new Date(commit.commitDate),
          end: new Date(commit.commitDate),
        },
        commits: [commit],
      };
      releaseGroups.unshift(currentGroup); // 맨 앞에 추가
    }
  });

  return releaseGroups;
}

/**
 * 릴리즈 그룹별 폴더 활동 분석
 */
export function analyzeReleaseFolderActivity(releaseGroups: ReleaseGroup[], folderDepth = 1): ReleaseFolderActivity[] {
  const activities: ReleaseFolderActivity[] = [];

  releaseGroups.forEach((group) => {
    const folderStats = new Map<
      string,
      {
        totalChanges: number;
        insertions: number;
        deletions: number;
        commitCount: number;
        contributors: Set<string>;
      }
    >();

    // 각 커밋의 파일 변경사항 분석
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
        if (!folderActivity) return;
        folderActivity.insertions += stats.insertions;
        folderActivity.deletions += stats.deletions;
        folderActivity.totalChanges += stats.insertions + stats.deletions;
        folderActivity.contributors.add(authorName);
      });
    });

    // 폴더별 고유 커밋 수 계산
    group.commits.forEach((commit) => {
      const foldersInCommit = new Set<string>();
      Object.keys(commit.diffStatistics.files).forEach((filePath) => {
        const folderPath = extractFolderFromPath(filePath, folderDepth);
        foldersInCommit.add(folderPath);
      });

      foldersInCommit.forEach((folderPath) => {
        const stats = folderStats.get(folderPath);
        if (stats) {
          stats.commitCount += 1;
        }
      });
    });

    // ReleaseFolderActivity 객체로 변환
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
 * 릴리즈별 상위 폴더 추출
 */
export function getTopFoldersByRelease(
  clusterNodeList: CommitData[],
  count = 8,
  folderDepth = 1
): {
  releaseGroups: ReleaseGroup[];
  folderActivities: ReleaseFolderActivity[];
  topFolders: string[];
} {
  const releaseGroups = groupCommitsByReleaseTags(clusterNodeList);
  const folderActivities = analyzeReleaseFolderActivity(releaseGroups, folderDepth);

  // 전체 기간 동안 가장 활발한 폴더들 추출
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

/**
 * 특정 릴리즈 그룹의 기여자 활동 추출
 */
export function extractReleaseContributorActivities(
  releaseGroups: ReleaseGroup[],
  topFolders: string[],
  folderDepth = 1
): ReleaseContributorActivity[] {
  const activities: ReleaseContributorActivity[] = [];

  releaseGroups.forEach((group, releaseIndex) => {
    const contributorFolderStats = new Map<
      string,
      Map<
        string,
        {
          changes: number;
          insertions: number;
          deletions: number;
          lastDate: Date;
        }
      >
    >();

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
        if (!folderStats) return;
        folderStats.changes += stats.insertions + stats.deletions;
        folderStats.insertions += stats.insertions;
        folderStats.deletions += stats.deletions;
        folderStats.lastDate = commitDate;
      });
    });

    // 활동 데이터로 변환
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

/**
 * 릴리즈 기반 상위 폴더 분석
 */
export function analyzeReleaseBasedFolders(
  totalData: CommitData[],
  count = 8,
  folderDepth = 1
): {
  releaseGroups: ReleaseGroup[];
  topFolders: ReleaseFolderActivity[];
  topFolderPaths: string[];
} {
  const result = getTopFoldersByRelease(totalData, count, folderDepth);

  return {
    releaseGroups: result.releaseGroups,
    topFolders: result.folderActivities,
    topFolderPaths: result.topFolders,
  };
}

/**
 * 릴리즈 기반 기여자 활동 추출
 */
export function extractReleaseBasedContributorActivities(
  totalData: CommitData[],
  topFolderPaths: string[],
  folderDepth = 1
): ReleaseContributorActivity[] {
  const result = getTopFoldersByRelease(totalData, topFolderPaths.length, folderDepth);
  return extractReleaseContributorActivities(result.releaseGroups, topFolderPaths, folderDepth);
}

/**
 * 릴리즈 기반 플로우 라인 데이터 생성
 */
export function generateReleaseFlowLineData(
  contributorActivities: ReleaseContributorActivity[]
): ReleaseFlowLineData[] {
  const activitiesByContributor = new Map<string, ReleaseContributorActivity[]>();
  contributorActivities.forEach((activity) => {
    if (!activitiesByContributor.has(activity.contributorName)) {
      activitiesByContributor.set(activity.contributorName, []);
    }
    activitiesByContributor.get(activity.contributorName)?.push(activity);
  });

  const flowLineData: ReleaseFlowLineData[] = [];

  activitiesByContributor.forEach((contributorActivitiesList) => {
    contributorActivitiesList.sort((a, b) => a.releaseIndex - b.releaseIndex || a.date.getTime() - b.date.getTime());

    for (let i = 0; i < contributorActivitiesList.length - 1; i += 1) {
      const current = contributorActivitiesList[i];
      const next = contributorActivitiesList[i + 1];

      if (current.releaseIndex !== next.releaseIndex) {
        flowLineData.push({
          startReleaseIndex: current.releaseIndex,
          startFolder: current.folderPath,
          endReleaseIndex: next.releaseIndex,
          endFolder: next.folderPath,
          contributorName: current.contributorName,
        });
      }
    }
  });

  return flowLineData;
}

/**
 * 릴리즈 기반 첫 번째 기여자 노드 찾기
 */
export function findFirstReleaseContributorNodes(
  contributorActivities: ReleaseContributorActivity[]
): Map<string, ReleaseContributorActivity> {
  const firstNodesByContributor = new Map<string, ReleaseContributorActivity>();
  const sortedActivities = [...contributorActivities].sort(
    (a, b) => a.releaseIndex - b.releaseIndex || a.date.getTime() - b.date.getTime()
  );

  sortedActivities.forEach((activity) => {
    const key = activity.contributorName;
    if (!firstNodesByContributor.has(key)) {
      firstNodesByContributor.set(key, activity);
    }
  });

  return firstNodesByContributor;
}




