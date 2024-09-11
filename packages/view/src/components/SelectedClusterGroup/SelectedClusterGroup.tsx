import { useState } from "react";
import type { MouseEvent } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import Chip from "@mui/material/Chip";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";

import { selectedDataUpdater } from "components/VerticalClusterList/VerticalClusterList.util";
import { getInitData, getClusterById } from "components/VerticalClusterList/Summary/Summary.util";
import { useGlobalData } from "hooks";

import "./SelectedClusterGroup.scss";

const SelectedClusterGroup = () => {
  const { selectedData, setSelectedData } = useGlobalData();
  const selectedClusters = getInitData(selectedData);

  const [menuAnchorElement, setMenuAnchorElement] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(menuAnchorElement);

  const openClusterGroup = (event: MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorElement(event.currentTarget);
  };

  const closeClusterGroup = () => {
    setMenuAnchorElement(null);
  };

  const deselectCluster = (clusterId: number) => () => {
    const selected = getClusterById(selectedData, clusterId);
    setSelectedData(selectedDataUpdater(selected, clusterId));
  };

  return (
    <div className="selected-clusters">
      <Button
        className="selected-clusters__label"
        id="cluster-group-button"
        aria-controls={isOpen ? "cluster-group-box" : undefined}
        aria-expanded={isOpen ? "true" : undefined}
        aria-haspopup="true"
        sx={{ color: "inherit", padding: 0, textTransform: "none" }}
        onClick={openClusterGroup}
      >
        Selected Nodes
        <ArrowDropDownRoundedIcon />
      </Button>
      <Menu
        className="selected-clusters__dropdown"
        id="cluster-group-box"
        anchorEl={menuAnchorElement}
        open={isOpen}
        MenuListProps={{
          "aria-labelledby": "cluster-group-button",
        }}
        onClose={closeClusterGroup}
      >
        {selectedClusters.map((selectedCluster) => (
          <li key={selectedCluster.clusterId}>
            <Chip
              className="selected-clusters__item"
              label={selectedCluster.summary.content.message}
              onDelete={deselectCluster(selectedCluster.clusterId)}
            />
          </li>
        ))}
      </Menu>
    </div>
  );
};

export default SelectedClusterGroup;
