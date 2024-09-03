import { Tooltip, Avatar } from "@mui/material";
import { GITHUB_URL } from "../../../constants/constants";
import type { AuthorInfo } from "types";

const Author = ({ name, src }: AuthorInfo) => {
  return (
    <Tooltip
      title={name}
      placement="top-start"
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
