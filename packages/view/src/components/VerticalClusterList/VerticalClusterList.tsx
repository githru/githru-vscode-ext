import { useRef } from "react";

import "./VerticalClusterList.scss";

import { ClusterGraph } from "./ClusterGraph";
import { Summary } from "./Summary";
import type { VerticalClusterListProps } from "./VerticalClusterList.type";

const VerticalClusterList = ({
  data,
  setSelectedData,
  selectedData,
}: VerticalClusterListProps) => {
  const detailRef = useRef<HTMLDivElement>(null);

  return (
    <div className="vertical-cluster-list">
      <ClusterGraph
        data={data}
        selectedData={selectedData}
        setSelectedData={setSelectedData}
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
