import InputLabel from "@mui/material/InputLabel";
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
        <InputLabel id="branch-select-small-label">Branches</InputLabel>
        <Select
          labelId="branch-select-small-label"
          id="branch-select-small"
          value={selectedBranch}
          label="Branches"
          onChange={handleChangeSelect}
          className="select-box"
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
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
