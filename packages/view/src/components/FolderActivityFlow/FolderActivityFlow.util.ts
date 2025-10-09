import type * as d3 from "d3";

import type { ClusterNode } from "types";

import { extractFolderFromPath, type FolderActivity } from "./FolderActivityFlow.analyzer";
import {
  getTopFoldersByRelease,
  extractReleaseContributorActivities,
  type ReleaseGroup,
  type ReleaseFolderActivity,
} from "./FolderActivityFlow.releaseAnalyzer";
import type {
  ContributorActivity,
  FlowLineData,
  ReleaseContributorActivity,
  ReleaseFlowLineData,
} from "./FolderActivityFlow.type";

// 기여자 활동 데이터 추출
export function extractContributorActivities(
  totalData: ClusterNode[],
  topFolders: FolderActivity[],
  currentPath: string
): ContributorActivity[] {
  const contributorActivities: ContributorActivity[] = [];

  totalData.forEach((cluster, clusterIndex) => {
    const clusterId = `cluster-${clusterIndex}`;

    cluster.commitNodeList.forEach((commitNode) => {
      if (commitNode.commit.commitDate) {
        const { commit } = commitNode;
        const date = new Date(commit.commitDate);

        if (commit.author?.names?.[0] && commit.author?.emails?.[0] && commit.diffStatistics?.files) {
          const contributorName = commit.author.names[0].trim();
          const contributorId = `${contributorName}-${commit.author.emails[0]}`;

          const folderChanges = new Map<string, { insertions: number; deletions: number }>();

          Object.entries(commit.diffStatistics.files).forEach(
            ([filePath, stats]: [string, { insertions: number; deletions: number }]) => {
              let folderPath: string;

              if (currentPath === "") {
                folderPath = extractFolderFromPath(filePath, 1);
              } else if (filePath.startsWith(`${currentPath}/`)) {
                const relativePath = filePath.substring(currentPath.length + 1);
                const pathParts = relativePath.split("/");
                folderPath = `${currentPath}/${pathParts[0]}`;
              } else {
                return;
              }

              if (topFolders.some((f) => f.folderPath === folderPath)) {
                if (!folderChanges.has(folderPath)) {
                  folderChanges.set(folderPath, { insertions: 0, deletions: 0 });
                }
                const folder = folderChanges.get(folderPath);
                if (folder) {
                  folder.insertions += stats.insertions;
                  folder.deletions += stats.deletions;
                }
              }
            }
          );

          folderChanges.forEach((stats, folderPath) => {
            contributorActivities.push({
              contributorId,
              contributorName,
              date,
              folderPath,
              changes: stats.insertions + stats.deletions,
              insertions: stats.insertions,
              deletions: stats.deletions,
              clusterId,
              clusterIndex,
            });
          });
        }
      }
    });
  });

  return contributorActivities.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// 플로우 라인 데이터 생성
export function generateFlowLineData(contributorActivities: ContributorActivity[]): FlowLineData[] {
  const activitiesByContributor = new Map<string, ContributorActivity[]>();
  contributorActivities.forEach((activity) => {
    if (!activitiesByContributor.has(activity.contributorId)) {
      activitiesByContributor.set(activity.contributorId, []);
    }
    const activities = activitiesByContributor.get(activity.contributorId);
    if (activities) {
      activities.push(activity);
    }
  });

  const flowLineData: FlowLineData[] = [];

  activitiesByContributor.forEach((activities) => {
    activities.sort((a, b) => a.clusterIndex - b.clusterIndex || a.date.getTime() - b.date.getTime());

    for (let i = 0; i < activities.length - 1; i += 1) {
      const current = activities[i];
      const next = activities[i + 1];

      if (current.clusterIndex !== next.clusterIndex) {
        flowLineData.push({
          startClusterIndex: current.clusterIndex,
          startFolder: current.folderPath,
          endClusterIndex: next.clusterIndex,
          endFolder: next.folderPath,
          contributorName: current.contributorName,
        });
      }
    }
  });

  return flowLineData;
}

// 클러스터 내 노드 위치 계산
export function calculateNodePosition(
  activity: ContributorActivity,
  xScale: d3.ScaleBand<string>,
  activitiesByCluster: Map<number, ContributorActivity[]>
): number {
  const clusterX = (xScale(String(activity.clusterIndex)) || 0) + xScale.bandwidth() / 2;
  const clusterActivities = activitiesByCluster.get(activity.clusterIndex) || [];
  const activityIndex = clusterActivities.findIndex(
    (a) =>
      a.contributorId === activity.contributorId &&
      a.folderPath === activity.folderPath &&
      a.date.getTime() === activity.date.getTime()
  );
  const offsetRange = xScale.bandwidth() * 0.8;
  const offset =
    (activityIndex - (clusterActivities.length - 1) / 2) * (offsetRange / Math.max(clusterActivities.length, 1));
  return clusterX + offset;
}

// 첫 번째 기여자 노드 찾기
export function findFirstContributorNodes(
  contributorActivities: ContributorActivity[]
): Map<string, ContributorActivity> {
  const firstNodesByContributor = new Map<string, ContributorActivity>();
  const sortedActivities = [...contributorActivities].sort(
    (a, b) => a.clusterIndex - b.clusterIndex || a.date.getTime() - b.date.getTime()
  );

  sortedActivities.forEach((activity) => {
    const key = activity.contributorId;
    if (!firstNodesByContributor.has(key)) {
      firstNodesByContributor.set(key, activity);
    }
  });

  return firstNodesByContributor;
}

// 플로우 라인 경로 생성
export function generateFlowLinePath(
  d: FlowLineData,
  xScale: d3.ScaleBand<string>,
  yScale: d3.ScaleBand<string>
): string {
  const x1 = (xScale(String(d.startClusterIndex)) || 0) + xScale.bandwidth() / 2;
  const y1 = (yScale(d.startFolder) || 0) + yScale.bandwidth() / 2;
  const x2 = (xScale(String(d.endClusterIndex)) || 0) + xScale.bandwidth() / 2;
  const y2 = (yScale(d.endFolder) || 0) + yScale.bandwidth() / 2;
  const midX = (x1 + x2) / 2;
  return `M ${x1},${y1} Q ${midX},${y1} ${midX},${(y1 + y2) / 2} Q ${midX},${y2} ${x2},${y2}`;
}

// === ReleaseTags 기반 유틸리티 함수들 ===

// 릴리즈 기반 상위 폴더 분석
export function analyzeReleaseBasedFolders(
  totalData: ClusterNode[],
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

export function getRootFolders(totalData: ClusterNode[]): {
  folders: string[];
  releaseGroups: ReleaseGroup[];
} {
  const flatData = totalData.flat();
  const releaseResult = analyzeReleaseBasedFolders(flatData, 8, 1);
  return {
    folders: releaseResult.topFolderPaths,
    releaseGroups: releaseResult.releaseGroups,
  };
}

// 릴리즈 기반 기여자 활동 추출
export function extractReleaseBasedContributorActivities(
  totalData: ClusterNode[],
  topFolderPaths: string[],
  folderDepth = 1
): ReleaseContributorActivity[] {
  const result = getTopFoldersByRelease(totalData, topFolderPaths.length, folderDepth);
  return extractReleaseContributorActivities(result.releaseGroups, topFolderPaths, folderDepth);
}

// 릴리즈 기반 플로우 라인 데이터 생성
export function generateReleaseFlowLineData(
  contributorActivities: ReleaseContributorActivity[]
): ReleaseFlowLineData[] {
  const activitiesByContributor = new Map<string, ReleaseContributorActivity[]>();
  contributorActivities.forEach((activity) => {
    if (!activitiesByContributor.has(activity.contributorName)) {
      activitiesByContributor.set(activity.contributorName, []);
    }
    const activities = activitiesByContributor.get(activity.contributorName);
    if (activities) {
      activities.push(activity);
    }
  });

  const flowLineData: ReleaseFlowLineData[] = [];

  activitiesByContributor.forEach((activities) => {
    activities.sort((a, b) => a.releaseIndex - b.releaseIndex || a.date.getTime() - b.date.getTime());

    for (let i = 0; i < activities.length - 1; i += 1) {
      const current = activities[i];
      const next = activities[i + 1];

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

// 릴리즈 기반 노드 위치 계산
export function calculateReleaseNodePosition(
  activity: ReleaseContributorActivity,
  xScale: d3.ScaleBand<string>,
  activitiesByRelease: Map<number, ReleaseContributorActivity[]>
): number {
  const releaseX = (xScale(String(activity.releaseIndex)) || 0) + xScale.bandwidth() / 2;
  const releaseActivities = activitiesByRelease.get(activity.releaseIndex) || [];
  const activityIndex = releaseActivities.findIndex(
    (a) =>
      a.contributorName === activity.contributorName &&
      a.folderPath === activity.folderPath &&
      a.date.getTime() === activity.date.getTime()
  );
  const offsetRange = xScale.bandwidth() * 0.8;
  const offset =
    (activityIndex - (releaseActivities.length - 1) / 2) * (offsetRange / Math.max(releaseActivities.length, 1));
  return releaseX + offset;
}

// 릴리즈 기반 첫 번째 기여자 노드 찾기
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

// 릴리즈 기반 플로우 라인 경로 생성
export function generateReleaseFlowLinePath(
  d: ReleaseFlowLineData,
  xScale: d3.ScaleBand<string>,
  yScale: d3.ScaleBand<string>
): string {
  const x1 = (xScale(String(d.startReleaseIndex)) || 0) + xScale.bandwidth() / 2;
  const y1 = (yScale(d.startFolder) || 0) + yScale.bandwidth() / 2;
  const x2 = (xScale(String(d.endReleaseIndex)) || 0) + xScale.bandwidth() / 2;
  const y2 = (yScale(d.endFolder) || 0) + yScale.bandwidth() / 2;
  const midX = (x1 + x2) / 2;
  return `M ${x1},${y1} Q ${midX},${y1} ${midX},${(y1 + y2) / 2} Q ${midX},${y2} ${x2},${y2}`;
}
