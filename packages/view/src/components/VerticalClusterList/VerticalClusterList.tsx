import "./VerticalClusterList.scss";

import { FilteredAuthors } from "components/FilteredAuthors";

import { Summary } from "./Summary";

const VerticalClusterList = () => {
  return (
    <div className="vertical-cluster-list">
      <FilteredAuthors />
      <Summary />
    </div>
  );
};

export default VerticalClusterList;
