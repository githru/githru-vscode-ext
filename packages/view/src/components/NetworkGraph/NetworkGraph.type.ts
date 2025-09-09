import type * as d3 from "d3";

export interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  type: "contributor" | "file";
  radius: number;
  weight: number;
  connectionCount: number;
}

export interface NetworkLink extends d3.SimulationLinkDatum<NetworkNode> {
  source: NetworkNode;
  target: NetworkNode;
  weight: number;
  sourceType: "contributor" | "file";
  targetType: "contributor" | "file";
}

export interface NetworkGraphData {
  nodes: NetworkNode[];
  links: NetworkLink[];
  colorScale: d3.ScaleOrdinal<string, string>;
}
