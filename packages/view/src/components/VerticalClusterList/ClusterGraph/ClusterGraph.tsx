import classNames from "classnames/bind";

import { useGlobalData } from "hooks";

import { getGraphHeight, getClusterSizes, getSelectedIndex } from "./ClusterGraph.util";
import { DETAIL_HEIGHT, SVG_WIDTH } from "./ClusterGraph.const";
import { useHandleClusterGraph } from "./ClusterGraph.hook";
import styles from "./ClusterGraph.module.scss";

const ClusterGraph = () => {
  const cx = classNames.bind(styles);
  const { filteredData: data, selectedData, setSelectedData } = useGlobalData();
  const clusterSizes = getClusterSizes(data);
  const selectedIndex = getSelectedIndex(data, selectedData);
  const graphHeight = getGraphHeight(clusterSizes) + selectedIndex.length * DETAIL_HEIGHT;

  const svgRef = useHandleClusterGraph({
    data,
    clusterSizes,
    selectedIndex,
    setSelectedData,
  });

  console.log(styles);

  return (
    <svg
      className={cx("cluster-graph")}
      ref={svgRef}
      width={SVG_WIDTH}
      height={graphHeight}
    />
  );
};

export default ClusterGraph;
