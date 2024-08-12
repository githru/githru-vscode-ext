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
        sx={{ width: 30, height: 30 }}
      />
    </Tooltip>
  );
};

export default Author;
