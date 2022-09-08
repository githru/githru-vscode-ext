import React from "react";

import type { GlobalProps, SelectedDataProps } from "types";

import "./VerticalClusterList.scss";
import { ClusterGraph } from "./ClusterGraph";
import { Summary } from "./Summary";

type Props = GlobalProps & {
  setSelectedData: React.Dispatch<React.SetStateAction<SelectedDataProps>>;
};

const VerticalClusterList = ({ data, setSelectedData }: Props) => {
  console.log(setSelectedData);
  return (
    <div className="vertical-cluster-list">
      <ClusterGraph data={data} setSelectedData={setSelectedData} />
      <Summary data={data} setSelectedData={setSelectedData} />
    </div>
  );
};

export default VerticalClusterList;
