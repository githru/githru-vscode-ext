import { useState } from "react";
import Chip from "@mui/material/Chip";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";

import { selectedDataUpdater } from "components/VerticalClusterList/VerticalClusterList.util";
import { getInitData, getClusterById } from "components/VerticalClusterList/Summary/Summary.util";
import { useGlobalData } from "hooks";

import "./SelectedClusterGroup.scss";

const SelectedClusterGroup = () => {
  const { selectedData, setSelectedData } = useGlobalData();
  const selectedClusters = getInitData(selectedData);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const deselectCluster = (clusterId: number) => () => {
    const selected = getClusterById(selectedData, clusterId);
    setSelectedData(selectedDataUpdater(selected, clusterId));
  };

  return (
    <div className="selected-clusters">
      <button
        type="button"
        className="selected-clusters__label"
        onClick={() => setIsOpen(!isOpen)}
      >
        Selected Nodes
        <ArrowDropDownRoundedIcon />
      </button>
      {isOpen && (
        <ul className="selected-clusters__list">
          {selectedClusters.map((selectedCluster) => (
            <li key={selectedCluster.clusterId}>
              <Chip
                className="selected-clusters__item"
                label={selectedCluster.summary.content.message}
                onDelete={deselectCluster(selectedCluster.clusterId)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SelectedClusterGroup;
