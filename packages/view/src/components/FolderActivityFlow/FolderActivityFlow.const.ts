export const DIMENSIONS = {
  width: 800,
  height: 400, // 기본 높이 (최소값)
  laneHeight: 60, // 각 폴더 레인당 고정 높이
  margin: { top: 40, right: 120, bottom: 60, left: 20 },
};

/**
 * 폴더 개수에 따라 차트 높이를 동적으로 계산
 * @param folderCount 폴더 개수
 * @returns 계산된 차트 높이
 */
export const calculateChartHeight = (folderCount: number): number => {
  const contentHeight = folderCount * DIMENSIONS.laneHeight;
  return DIMENSIONS.margin.top + contentHeight + DIMENSIONS.margin.bottom;
};
