const DEFAULT_WIDTH = 800;
export const LABEL_COLUMN_WIDTH = 140;

export const DIMENSIONS = {
  width: DEFAULT_WIDTH,
  height: 500, // 고정 높이
  margin: { top: 20, right: LABEL_COLUMN_WIDTH, bottom: 20, left: 30 },
};

export const LABEL_COLUMN_PADDING = 12;

export const getResponsiveChartWidth = (containerWidth?: number): number => {
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : DEFAULT_WIDTH;
  const baseWidth = containerWidth ?? viewportWidth;

  return Math.max(baseWidth, 0);
};
