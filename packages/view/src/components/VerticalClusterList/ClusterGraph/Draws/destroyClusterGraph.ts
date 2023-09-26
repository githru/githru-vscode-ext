import type { RefObject } from "react";
import * as d3 from "d3";

export const destroyClusterGraph = (target: RefObject<SVGElement>) => d3.select(target.current).selectAll("*").remove();
