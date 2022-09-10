import React from "react";

import type { GlobalProps, SelectedDataProps } from "types";

import { ClusterGraph } from "./ClusterGraph";
import { Summary } from "./Summary";

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
  return (
    <div className="vertical-cluster-list">
      <ClusterGraph
        data={data}
        selectedData={selectedData}
        setSelectedData={setSelectedData}
      />
      <Summary
        data={data}
        selectedData={selectedData}
        setSelectedData={setSelectedData}
      />
    </div>
  );
};

export default VerticalClusterList;
