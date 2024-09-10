import { Tooltip, Avatar } from "@mui/material";

import type { AuthorInfo } from "types";

import { GITHUB_URL } from "../../../constants/constants";

const Author = ({ name, src }: AuthorInfo) => {
  return (
    <Tooltip
      title={name}
      placement="top-start"
      PopperProps={{ sx: { ".MuiTooltip-tooltip": { bgcolor: "#3c4048" } } }}
    >
      <a
        href={`${GITHUB_URL}/${name}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
      >
        <Avatar
          alt={name}
          src={src}
          sx={{ width: 30, height: 30, minWidth: 30, minHeight: 30, cursor: "pointer" }}
        />
      </a>
    </Tooltip>
  );
};

export default Author;
