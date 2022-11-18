import type { BaseType, Selection } from "d3";

import type { ClusterNode } from "types";

export type ClusterGraphElement = {
  cluster: ClusterNode;
  clusterSize: number;
  selected: {
    prev: number[];
    current: number[];
  };
};

export type SVGElementSelection<T extends BaseType> = Selection<
  T | BaseType,
  ClusterGraphElement,
  SVGSVGElement | null,
  unknown
>;
