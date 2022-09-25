import { useRef } from "react";

import "./VerticalClusterList.scss";

import { ClusterGraph } from "./ClusterGraph";
import { Summary } from "./Summary";
import { useResizeObserver } from "./VerticalClusterList.hook";
import type { VerticalClusterListProps } from "./VerticalClusterList.type";

const VerticalClusterList = ({
  data,
  setSelectedData,
  selectedData,
}: VerticalClusterListProps) => {
  const detailRef = useRef<HTMLDivElement>(null);
  const [detailElementHeight] = useResizeObserver(detailRef, selectedData);

  return (
    <div className="vertical-cluster-list">
      <ClusterGraph
        data={data}
        selectedData={selectedData}
        setSelectedData={setSelectedData}
        detailElementHeight={detailElementHeight}
      />
      <Summary
        ref={detailRef}
        data={data}
        selectedData={selectedData}
        setSelectedData={setSelectedData}
      />
    </div>
  );
};

export default VerticalClusterList;
