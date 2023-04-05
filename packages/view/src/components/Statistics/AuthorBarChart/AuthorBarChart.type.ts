import type { METRIC_TYPE } from "./AuthorBarChart.const";

export type AuthorDataType = {
  name: string;
  commit: number;
  insertion: number;
  deletion: number;
};

export type MetricType = (typeof METRIC_TYPE)[0 | 1 | 2];

export type SrcInfo = {
  key: string;
  value: string;
};
