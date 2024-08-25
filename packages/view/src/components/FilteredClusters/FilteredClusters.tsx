import { useState } from "react";
import type { MouseEvent } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import Chip from "@mui/material/Chip";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";

import { selectedDataUpdater } from "components/VerticalClusterList/VerticalClusterList.util";
import { getInitData, getClusterById } from "components/VerticalClusterList/Summary/Summary.util";
import { useGlobalData } from "hooks";

import "./FilteredClusters.scss";

const FilteredClusters = () => {
  const { selectedData, setSelectedData } = useGlobalData();
  const selectedClusters = getInitData(selectedData);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);

  const openSelectedList = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeSelectedList = () => {
    setAnchorEl(null);
  };

  const deselectCluster = (clusterId: number) => () => {
    const selected = getClusterById(selectedData, clusterId);
    setSelectedData(selectedDataUpdater(selected, clusterId));
  };

  return (
    <div className="selected__content">
      <Button
        id="selected-list-button"
        aria-controls={isOpen ? "selected-list" : undefined}
        aria-expanded={isOpen ? "true" : undefined}
        aria-haspopup="true"
        sx={{ color: "inherit", padding: 0, textTransform: "none" }}
        onClick={openSelectedList}
      >
        <p>Clusters</p>
        <ArrowDropDownRoundedIcon />
      </Button>
      <Menu
        className="selected__cluster"
        id="selected-list"
        anchorEl={anchorEl}
        open={isOpen}
        MenuListProps={{
          "aria-labelledby": "selected-list-button",
        }}
        onClose={closeSelectedList}
      >
        {selectedClusters.map((selectedCluster) => {
          return (
            <li key={selectedCluster.clusterId}>
              <Chip
                label={selectedCluster.summary.content.message}
                onDelete={deselectCluster(selectedCluster.clusterId)}
              />
            </li>
          );
        })}
      </Menu>
    </div>
  );
};

export default FilteredClusters;
