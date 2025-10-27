import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import type { SelectChangeEvent } from "@mui/material/Select";
import Select from "@mui/material/Select";

import { sendFetchAnalyzedDataCommand } from "services";
import "./BranchSelector.scss";
import { useBranchStore, useLoadingStore } from "store";
import { COMMIT_COUNT_PER_PAGE } from "constants/constants";

import { SLICE_LENGTH } from "./BranchSelector.const";

const BranchSelector = () => {
  const { branchList, selectedBranch, setSelectedBranch } = useBranchStore();
  const { setLoading } = useLoadingStore();

  const handleChangeSelect = (event: SelectChangeEvent) => {
    setSelectedBranch(event.target.value);
    setLoading(true);
    sendFetchAnalyzedDataCommand({ baseBranch: event.target.value, commitCountPerPage: COMMIT_COUNT_PER_PAGE });
  };

  return (
    <div className="branch-selector">
      <p>Branches: </p>
      <FormControl>
        <Select
          value={selectedBranch}
          onChange={handleChangeSelect}
          className="branch-selector__select-box"
          inputProps={{ "aria-label": "Without label" }}
        >
          {branchList?.map((option) => (
            <MenuItem
              key={option}
              value={option}
              title={option}
            >
              {option.length <= SLICE_LENGTH ? option : `${option.slice(0, SLICE_LENGTH)}...`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default BranchSelector;
