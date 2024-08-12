import { Tooltip, Avatar } from "@mui/material";

import type { AuthorInfo } from "types";

const Author = ({ name, src }: AuthorInfo) => {
  return (
    <Tooltip
      title={name}
      placement="top-start"
    >
      <Avatar
        alt={name}
        src={src}
      />
    </Tooltip>
  );
};

export default Author;
