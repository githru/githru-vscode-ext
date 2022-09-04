import type { GlobalProps } from "types/global";
import "./VerticalClusterList.scss";

import { ClusterGraph } from "components/VerticalClusterList/ClusterGraph";

import { Summary } from "./Summary";

const VerticalClusterList = ({ data }: GlobalProps) => {
  return (
    <div className="vertical-cluster-list">
      <ClusterGraph data={data} />
      <Summary data={data} />
    </div>
  );
};

export default VerticalClusterList;
