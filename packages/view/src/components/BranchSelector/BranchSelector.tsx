import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import type { SelectChangeEvent } from "@mui/material/Select";
import Select from "@mui/material/Select";

import { useGlobalData } from "hooks";
import { sendFetchAnalyzedDataCommand } from "services";
import "./BranchSelector.scss";

const BranchSelector = () => {
  const { branchList, selectedBranch, setSelectedBranch, setLoading } = useGlobalData();

  const handleChangeSelect = (event: SelectChangeEvent) => {
    setSelectedBranch(event.target.value);
    setLoading(true);
    sendFetchAnalyzedDataCommand(event.target.value);
  };

  return (
    <div className="branch-selector">
      <p>Branches: </p>
      <FormControl
        sx={{ m: 1, minWidth: 120 }}
        size="small"
      >
        <Select
          value={selectedBranch}
          displayEmpty
          onChange={handleChangeSelect}
          className="select-box"
          inputProps={{ "aria-label": "Without label" }}
        >
          {branchList?.map((option) => (
            <MenuItem
              key={option}
              value={option}
            >
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default BranchSelector;
