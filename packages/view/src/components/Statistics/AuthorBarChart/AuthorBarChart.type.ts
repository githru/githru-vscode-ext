import type { METRIC_TYPE } from "./AuthorBarChart.const";

export type AuthorDataType = {
  name: string;
  commit: number;
  insertion: number;
  deletion: number;
  names?: string[];
};

export type MetricType = (typeof METRIC_TYPE)[number];

export type AuthorDataObj = {
  [key: string]: {
    name: string;
    commit: number;
    insertion: number;
    deletion: number;
  };
};
