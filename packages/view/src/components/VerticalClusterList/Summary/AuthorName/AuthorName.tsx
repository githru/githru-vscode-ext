import { getColorValue } from "../Summary.util";

const AuthorName = ({ authorName }: { authorName: string }) => {
  const colorValue = getColorValue(authorName);
  return (
    <span
      className={["name"].join(" ")}
      data-tooltip-text={authorName}
      style={{ backgroundColor: colorValue }}
    >
      {authorName.slice(0, 1)}
    </span>
  );
};

export default AuthorName;
