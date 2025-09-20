import React from "react";
import { useShallow } from "zustand/react/shallow";

import { useDataStore } from "store";
import type { ClusterGraphProps } from "types/ClusterGraphProps";

import { getGraphHeight, getSelectedIndex } from "./ClusterGraph.util";
import { DETAIL_HEIGHT, SVG_WIDTH } from "./ClusterGraph.const";
import { useHandleClusterGraph } from "./ClusterGraph.hook";

import "./ClusterGraph.scss";

const ClusterGraph: React.FC<ClusterGraphProps> = ({ index }) => {
  const [filteredData, selectedData, setSelectedData] = useDataStore(
    useShallow((state) => [state.filteredData, state.selectedData, state.setSelectedData])
  );
  const data = [filteredData[index]];
  const selectedIndex = getSelectedIndex(data, selectedData);
  const clusterSize = data[0].commitNodeList.length;
  const graphHeight = getGraphHeight([clusterSize]) + selectedIndex.length * DETAIL_HEIGHT;

  const svgRef = useHandleClusterGraph({
    data,
    clusterSize,
    selectedIndex,
    setSelectedData,
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
