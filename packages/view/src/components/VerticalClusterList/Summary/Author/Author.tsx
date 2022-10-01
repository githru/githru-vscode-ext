import React from "react";

import type { AuthorProps } from "../Summary.type";
import { getColorValue } from "../Summary.util";

const Author = ({ name }: AuthorProps) => {
  const colorValue = getColorValue(name);

  const url = `https://github.com/${name}.png`;

  return (
    <span className="name" data-tooltip-text={name}>
      <img
        className={["name"].join(" ")}
        data-text={name.slice(0, 1)}
        src={url}
        alt=""
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          e.currentTarget.style.filter = "none";
          e.currentTarget.style.overflow = "hidden";
          e.currentTarget.style.background = colorValue;
        }}
      />
    </span>
  );
};

export default Author;
