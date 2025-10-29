import type * as d3 from "d3";

import type { ClusterNode } from "types";

import {
  getTopFoldersByRelease,
  extractReleaseContributorActivities,
  type ReleaseGroup,
  type ReleaseFolderActivity,
} from "./StorylineChart.releaseAnalyzer";
import type { ReleaseContributorActivity, ReleaseFlowLineData } from "./StorylineChart.type";

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

      // 같은 릴리즈, 같은 폴더, 같은 시간이 아닌 경우 선을 그림
      // (오프셋이 다른 경우 = 다른 릴리즈, 다른 폴더, 또는 다른 시간)
      const isSamePosition =
        current.releaseIndex === next.releaseIndex &&
        current.folderPath === next.folderPath &&
        current.date.getTime() === next.date.getTime();

      // 릴리즈가 연속적인지 확인 (같은 릴리즈이거나 바로 다음 릴리즈인 경우만)
      const isConsecutiveRelease =
        current.releaseIndex === next.releaseIndex || current.releaseIndex + 1 === next.releaseIndex;

      if (!isSamePosition && isConsecutiveRelease) {
        flowLineData.push({
          startReleaseIndex: current.releaseIndex,
          startFolder: current.folderPath,
          startDate: current.date,
          endReleaseIndex: next.releaseIndex,
          endFolder: next.folderPath,
          endDate: next.date,
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
