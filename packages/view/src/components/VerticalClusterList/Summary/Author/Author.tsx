import type { AuthorProps } from "../Summary.type";
import { getColorValue } from "../Summary.util";

const Author = ({ name }: AuthorProps) => {
  const colorValue = getColorValue(name);

  return (
    <span
      className={["name"].join(" ")}
      data-tooltip-text={name}
      style={{
        background: `linear-gradient( rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3) ), center / cover no-repeat url("https://github.com/${name}.png"),
        ${colorValue}`,
      }}
    >
      {`${name.slice(0, 1)}`}
    </span>
  );
};

export default Author;
