import type { ClusterNode } from "types";

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
 * 폴더 경로에서 지정된 깊이의 폴더를 추출
 */
export function extractFolderFromPath(filePath: string, depth: number = 1): string {
  const parts = filePath.split('/');
  if (parts.length === 1) return '.'; // 루트 레벨 파일

  const folderParts = parts.slice(0, Math.min(depth, parts.length - 1));
  return folderParts.length > 0 ? folderParts.join('/') : '.';
}

/**
 * 커밋들을 releaseTags 기준으로 그룹화
 * releaseTags가 없는 커밋은 이전 releaseTags와 합침
 */
export function groupCommitsByReleaseTags(clusterNodeList: ClusterNode[]): ReleaseGroup[] {
  // 모든 커밋을 시간순으로 정렬
  const allCommits: CommitData[] = [];
  clusterNodeList.forEach(cluster => {
    cluster.commitNodeList.forEach(commitNode => {
      allCommits.push(commitNode.commit);
    });
  });

  // 커밋 날짜 기준으로 정렬
  allCommits.sort((a, b) => new Date(a.commitDate).getTime() - new Date(b.commitDate).getTime());

  const releaseGroups: ReleaseGroup[] = [];
  let currentGroup: ReleaseGroup | null = null;

  for (const commit of allCommits) {
    if (commit.releaseTags && commit.releaseTags.length > 0) {
      // 새로운 릴리즈 태그가 있는 경우, 새 그룹 시작
      for (const releaseTag of commit.releaseTags) {
        currentGroup = {
          releaseTag,
          commitCount: 1,
          dateRange: {
            start: new Date(commit.commitDate),
            end: new Date(commit.commitDate)
          },
          commits: [commit]
        };
        releaseGroups.push(currentGroup);
      }
    } else {
      // releaseTags가 없는 경우
      if (currentGroup) {
        // 기존 그룹에 추가
        currentGroup.commits.push(commit);
        currentGroup.commitCount++;
        currentGroup.dateRange.end = new Date(commit.commitDate);
      } else {
        // 첫 번째 릴리즈 태그 이전의 커밋들을 위한 그룹 생성
        currentGroup = {
          releaseTag: "Pre-release",
          commitCount: 1,
          dateRange: {
            start: new Date(commit.commitDate),
            end: new Date(commit.commitDate)
          },
          commits: [commit]
        };
        releaseGroups.unshift(currentGroup); // 맨 앞에 추가
      }
    }
  }

  return releaseGroups;
}

/**
 * 릴리즈 그룹별 폴더 활동 분석
 */
export function analyzeReleaseFolderActivity(
  releaseGroups: ReleaseGroup[],
  folderDepth: number = 1
): ReleaseFolderActivity[] {
  const activities: ReleaseFolderActivity[] = [];

  releaseGroups.forEach(group => {
    const folderStats = new Map<string, {
      totalChanges: number;
      insertions: number;
      deletions: number;
      commitCount: number;
      contributors: Set<string>;
    }>();

    // 각 커밋의 파일 변경사항 분석
    group.commits.forEach(commit => {
      const authorName = commit.author.names[0] || 'Unknown';

      Object.entries(commit.diffStatistics.files).forEach(([filePath, stats]) => {
        const folderPath = extractFolderFromPath(filePath, folderDepth);

        if (!folderStats.has(folderPath)) {
          folderStats.set(folderPath, {
            totalChanges: 0,
            insertions: 0,
            deletions: 0,
            commitCount: 0,
            contributors: new Set()
          });
        }

        const folderActivity = folderStats.get(folderPath)!;
        folderActivity.insertions += stats.insertions;
        folderActivity.deletions += stats.deletions;
        folderActivity.totalChanges += stats.insertions + stats.deletions;
        folderActivity.contributors.add(authorName);
      });
    });

    // 폴더별 고유 커밋 수 계산
    group.commits.forEach(commit => {
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

    // ReleaseFolderActivity 객체로 변환
    folderStats.forEach((stats, folderPath) => {
      activities.push({
        folderPath,
        releaseTag: group.releaseTag,
        totalChanges: stats.totalChanges,
        insertions: stats.insertions,
        deletions: stats.deletions,
        commitCount: stats.commitCount,
        contributors: Array.from(stats.contributors)
      });
    });
  });

  return activities;
}

/**
 * 릴리즈별 상위 폴더 추출
 */
export function getTopFoldersByRelease(
  clusterNodeList: ClusterNode[],
  count: number = 8,
  folderDepth: number = 1
): {
  releaseGroups: ReleaseGroup[];
  folderActivities: ReleaseFolderActivity[];
  topFolders: string[];
} {
  const releaseGroups = groupCommitsByReleaseTags(clusterNodeList);
  const folderActivities = analyzeReleaseFolderActivity(releaseGroups, folderDepth);

  // 전체 기간 동안 가장 활발한 폴더들 추출
  const globalFolderStats = new Map<string, number>();
  folderActivities.forEach(activity => {
    const current = globalFolderStats.get(activity.folderPath) || 0;
    globalFolderStats.set(activity.folderPath, current + activity.totalChanges);
  });

  const topFolders = Array.from(globalFolderStats.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([folderPath]) => folderPath);

  return {
    releaseGroups,
    folderActivities: folderActivities.filter(activity =>
      topFolders.includes(activity.folderPath)
    ),
    topFolders
  };
}

/**
 * 특정 릴리즈 그룹의 기여자 활동 추출
 */
export function extractReleaseContributorActivities(
  releaseGroups: ReleaseGroup[],
  topFolders: string[],
  folderDepth: number = 1
) {
  const activities: Array<{
    contributorName: string;
    folderPath: string;
    releaseTag: string;
    releaseIndex: number;
    changes: number;
    insertions: number;
    deletions: number;
    date: Date;
  }> = [];

  releaseGroups.forEach((group, releaseIndex) => {
    const contributorFolderStats = new Map<string, Map<string, {
      changes: number;
      insertions: number;
      deletions: number;
      lastDate: Date;
    }>>();

    group.commits.forEach(commit => {
      const authorName = commit.author.names[0] || 'Unknown';
      const commitDate = new Date(commit.commitDate);

      if (!contributorFolderStats.has(authorName)) {
        contributorFolderStats.set(authorName, new Map());
      }

      const contributorStats = contributorFolderStats.get(authorName)!;

      Object.entries(commit.diffStatistics.files).forEach(([filePath, stats]) => {
        const folderPath = extractFolderFromPath(filePath, folderDepth);

        if (!topFolders.includes(folderPath)) return;

        if (!contributorStats.has(folderPath)) {
          contributorStats.set(folderPath, {
            changes: 0,
            insertions: 0,
            deletions: 0,
            lastDate: commitDate
          });
        }

        const folderStats = contributorStats.get(folderPath)!;
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
          date: stats.lastDate
        });
      });
    });
  });

  return activities;
}