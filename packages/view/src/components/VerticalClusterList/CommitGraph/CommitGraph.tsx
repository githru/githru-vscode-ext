import { useGlobalData } from "hooks";

import { SVG_MARGIN } from "../ClusterGraph/ClusterGraph.const";

import { CELL_HEIGHT } from "./CommitGraph.const";
import useHandleCommitGraph from "./CommitGraph.hook";

const CommitGraph = () => {
  const { commitGraphNodes } = useGlobalData();
  const svgRef = useHandleCommitGraph({ commits: commitGraphNodes });
  const svgHeight =
    commitGraphNodes.length * CELL_HEIGHT + SVG_MARGIN.top + SVG_MARGIN.bottom;

  return <svg className="cluster-graph" ref={svgRef} height={svgHeight} />;
};

export default CommitGraph;
