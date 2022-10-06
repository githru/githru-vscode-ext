import { useRef, useEffect } from "react";
import * as d3 from "d3";
import "./CommitGraph.scss";

import { commitGraphPosition } from "./CommitGraph.util";
import type { CommitDictionary, CommitGraphNode } from "./CommitGraph.type";

const useHandleCommitGraph = ({ commits }: { commits: CommitGraphNode[] }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const commitDict: CommitDictionary = commits.reduce((dict, commit, i) => {
    return { ...dict, [commit.id]: { ...commit, index: i } };
  }, {});

  useEffect(() => {
    const {
      getPointPosition,
      getVerticalLinkPosition,
      getHorizontalLinkPosition,
    } = commitGraphPosition(commitDict);
    const pointPositions = getPointPosition(commits);
    const verticalLinkPosition = getVerticalLinkPosition(commits);
    const horizontalLinkPosition = getHorizontalLinkPosition(commits);

    const svg = d3.select(svgRef.current);

    svg
      .selectAll(".commit-graph__point")
      .data(pointPositions)
      .join("circle")
      .attr("class", "commit-graph__point")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y);

    svg
      .selectAll(".commit-graph__vertical-link")
      .data(verticalLinkPosition)
      .join("line")
      .attr("class", "commit-graph__vertical-link")
      .attr("x1", (d) => d.x[0])
      .attr("x2", (d) => d.x[1])
      .attr("y1", (d) => d.y[0])
      .attr("y2", (d) => d.y[1]);

    svg
      .selectAll(".commit-graph__horizontal-link")
      .data(horizontalLinkPosition)
      .join("line")
      .attr("class", "commit-graph__horizontal-link")
      .attr("x1", (d) => d.x[0])
      .attr("x2", (d) => d.x[1])
      .attr("y1", (d) => d.y[0])
      .attr("y2", (d) => d.y[1]);
  }, [commits]);

  return svgRef;
};

export default useHandleCommitGraph;
