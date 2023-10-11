import "./VerticalClusterList.scss";

import { ClusterGraph } from "./ClusterGraph";
import { Summary } from "./Summary";

const VerticalClusterList = () => {
  return (
    <div className="vertical-cluster-list">
      <ClusterGraph />
      <Summary />
    </div>
  );
};

export default VerticalClusterList;
