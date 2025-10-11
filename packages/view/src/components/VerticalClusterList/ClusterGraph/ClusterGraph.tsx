import React from "react";
import { useShallow } from "zustand/react/shallow";

import { useDataStore } from "store";
import type { ClusterGraphProps } from "types/ClusterGraphProps";

import { getGraphHeight, getSelectedIndex } from "./ClusterGraph.util";
import { DETAIL_HEIGHT, SVG_WIDTH } from "./ClusterGraph.const";
import { useHandleClusterGraph } from "./ClusterGraph.hook";

import "./ClusterGraph.scss";

const ClusterGraph: React.FC<ClusterGraphProps> = ({ data, clusterSizes }) => {
  const [selectedData, toggleSelectedData] = useDataStore(
    useShallow((state) => [state.selectedData, state.toggleSelectedData])
  );
  const selectedIndex = getSelectedIndex(data, selectedData);
  const graphHeight = getGraphHeight(clusterSizes) + selectedIndex.length * DETAIL_HEIGHT;

  const svgRef = useHandleClusterGraph({
    data,
    clusterSizes,
    selectedIndex,
    toggleSelectedData,
  });

  return (
    <svg
      className="cluster-graph"
      ref={svgRef}
      width={SVG_WIDTH}
      height={graphHeight}
    />
  );
};

export default ClusterGraph;
