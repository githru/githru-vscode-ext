import type { Margin } from "./LineChart";

export const WIDTH = 600;
export const BRUSH_MARGIN: Margin = {
  bottom: 0,
  left: 10,
  right: 10,
  top: 0,
};
export const COMMIT_CHART_HEIGHT = 50;
export const TEMPORAL_FILTER_LINE_CHART_STYLES = {
  // NOTE: Histograms are easier to read when they are wider than they are tall
  width: WIDTH,
  height: WIDTH * 0.9,
  padding: {
    top: 0.1,
    right: 0.3,
    bottom: 0.1,
    left: 0.5,
  },
  margin: {
    top: 50,
    right: 15,
    bottom: 15,
    left: 10,
  },
};
