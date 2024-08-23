import { useGlobalData } from "hooks";
import { FilteredAuthors } from "components/FilteredAuthors";
import { FilteredClusters } from "components/FilteredClusters";

import { Summary } from "./Summary";

import "./VerticalClusterList.scss";

const VerticalClusterList = () => {
  const { selectedData } = useGlobalData();

  return (
    <div className="vertical-cluster-list">
      {selectedData.length > 0 && (
        <div className="selected__container">
          <FilteredAuthors />
          <FilteredClusters />
        </div>
      )}
      <Summary />
    </div>
  );
};

export default VerticalClusterList;
