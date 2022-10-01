import "./ClusterGraph.scss";

import { useGlobalData } from "hooks/useGlobalData";

import {
  getGraphHeight,
  getClusterSizes,
  getSelectedIndex,
} from "./ClusterGraph.util";
import { DETAIL_HEIGHT, SVG_WIDTH } from "./ClusterGraph.const";
import { useHandleClusterGraph } from "./ClusterGraph.hook";

const ClusterGraph = () => {
  const { filteredData: data, selectedData, setSelectedData } = useGlobalData();
  const clusterSizes = getClusterSizes(data);
  const selectedIndex = getSelectedIndex(data, selectedData);
  const graphHeight =
    getGraphHeight(clusterSizes) + (selectedIndex < 0 ? 0 : DETAIL_HEIGHT);

  const svgRef = useHandleClusterGraph({
    data,
    clusterSizes,
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
