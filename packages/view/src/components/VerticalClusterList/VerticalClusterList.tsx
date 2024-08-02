import "./VerticalClusterList.scss";

import { FilteredAuthors } from "components/FilteredAuthors";

import { ClusterGraph } from "./ClusterGraph";
import { Summary } from "./Summary";

const VerticalClusterList = () => {
  return (
    <div className="vertical-cluster-list">
      <FilteredAuthors />
      <div className="vertical-cluster-list__content">
        <ClusterGraph />
        <Summary />
      </div>
    </div>
  );
};

export default VerticalClusterList;
