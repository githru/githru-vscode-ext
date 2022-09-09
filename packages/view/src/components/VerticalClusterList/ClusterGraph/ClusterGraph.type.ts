import type { BaseType, Selection } from "d3";

export type SVGElementSelection<T extends BaseType> = Selection<
  T,
  number,
  SVGSVGElement | null,
  unknown
>;
