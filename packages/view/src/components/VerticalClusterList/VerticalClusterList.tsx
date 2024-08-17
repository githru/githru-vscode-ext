import "./VerticalClusterList.scss";

import { FilteredAuthors } from "components/FilteredAuthors";

import { Summary } from "./Summary";

const VerticalClusterList = () => {
  return (
    <div className="vertical-cluster-list">
      <FilteredAuthors />
      <div className="vertical-cluster-list__content">
        <Summary />
      </div>
    </div>
  );
};

export default VerticalClusterList;
