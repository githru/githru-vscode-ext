import { Tooltip, Avatar } from "@mui/material";

import type { AuthorInfo } from "types";
import { GITHUB_URL } from "constants/constants";

import { AVATAR_STYLE, TOOLTIP_STYLE } from "./Author.const";

const isGitHubUser = (src: string | undefined): boolean => {
  return Boolean(src?.startsWith(GITHUB_URL));
};

const getGitHubProfileUrl = (username: string): string => {
  return `${GITHUB_URL}/${username}`;
};

const ClickableAvatar = ({ name, src }: AuthorInfo) => {
  return (
    <a
      href={getGitHubProfileUrl(name)}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none" }}
    >
      <Avatar
        alt={name}
        src={src}
        sx={{ ...AVATAR_STYLE, cursor: "pointer" }}
      />
    </a>
  );
};

const StaticAvatar = ({ name, src }: AuthorInfo) => {
  return (
    <Avatar
      alt={name}
      src={src}
      sx={AVATAR_STYLE}
    />
  );
};

const AvatarComponent = ({ name, src }: AuthorInfo) => {
  if (!src) {
    return (
      <Avatar
        alt={name}
        sx={AVATAR_STYLE}
      >
        {name.charAt(0).toUpperCase()}
      </Avatar>
    );
  }

  return isGitHubUser(src) ? (
    <ClickableAvatar
      name={name}
      src={src}
    />
  ) : (
    <StaticAvatar
      name={name}
      src={src}
    />
  );
};

const Author = ({ name, src }: AuthorInfo) => {
  return (
    <Tooltip
      title={name}
      placement="top-start"
      PopperProps={{ sx: TOOLTIP_STYLE }}
    >
      <AvatarComponent
        name={name}
        src={src}
      />
    </Tooltip>
  );
};

export default Author;
