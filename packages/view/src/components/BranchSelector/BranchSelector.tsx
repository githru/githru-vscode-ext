import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import type { SelectChangeEvent } from "@mui/material/Select";
import Select from "@mui/material/Select";

import { sendFetchAnalyzedDataCommand } from "services";
import "./BranchSelector.scss";
import { useBranchStore, useLoadingStore } from "store";

import { SLICE_LENGTH } from "./BranchSelector.const";
import { PER_PAGE } from "constants/constants";

const BranchSelector = () => {
  const { branchList, selectedBranch, setSelectedBranch } = useBranchStore();
  const { setLoading } = useLoadingStore();

  const handleChangeSelect = (event: SelectChangeEvent) => {
    setSelectedBranch(event.target.value);
    setLoading(true);
    sendFetchAnalyzedDataCommand({ baseBranch: event.target.value, perPage: PER_PAGE });
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
          onChange={handleChangeSelect}
          className="branch-selector__select-box"
          inputProps={{ "aria-label": "Without label" }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: "#212121",
                color: "white",
                marginTop: "0.0625rem",
                "& .MuiMenuItem-root": {
                  backgroundColor: "#212121 !important ",
                  "&:hover": {
                    backgroundColor: "#333333 !important",
                  },
                },
                "& .MuiMenuItem-root.Mui-selected": {
                  backgroundColor: "#333333 !important",
                },
              },
            },
          }}
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
