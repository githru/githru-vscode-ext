import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import Chip from "@mui/material/Chip";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";

import { getInitData, getClusterById } from "components/VerticalClusterList/Summary/Summary.util";
import "./SelectedClusterGroup.scss";
import { useDataStore } from "store";

const SelectedClusterGroup = () => {
  const [selectedData, toggleSelectedData] = useDataStore(
    useShallow((state) => [state.selectedData, state.toggleSelectedData])
  );
  const selectedClusters = getInitData(selectedData);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const deselectCluster = (clusterId: number) => () => {
    const selected = getClusterById(selectedData, clusterId);
    toggleSelectedData(selected, clusterId);
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
                title={selectedCluster.summary.content.message}
                label={selectedCluster.summary.content.title}
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
