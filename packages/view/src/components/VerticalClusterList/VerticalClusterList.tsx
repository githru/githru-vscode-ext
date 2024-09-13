import { useGlobalData } from "hooks";
import { FilteredAuthors } from "components/FilteredAuthors";
import { SelectedClusterGroup } from "components/SelectedClusterGroup";

import { Summary } from "./Summary";

import "./VerticalClusterList.scss";

const VerticalClusterList = () => {
  const { selectedData } = useGlobalData();

  return (
    <div className="vertical-cluster-list">
      {selectedData.length > 0 && (
        <div className="vertical-cluster-list__header">
          <FilteredAuthors />
          <SelectedClusterGroup />
        </div>
      )}
      <Summary />
    </div>
  );
};

export default VerticalClusterList;
