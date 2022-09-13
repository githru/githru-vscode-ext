import React, { useRef } from "react";

import type { GlobalProps, SelectedDataProps } from "types";

import { ClusterGraph } from "./ClusterGraph";
import { Summary } from "./Summary";
import { useResizeObserver } from "./VerticalClusterList.hook";

import "./VerticalClusterList.scss";

type Props = GlobalProps & {
  setSelectedData: React.Dispatch<React.SetStateAction<SelectedDataProps>>;
  selectedData: SelectedDataProps;
};

const VerticalClusterList = ({
  data,
  setSelectedData,
  selectedData,
}: Props) => {
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
