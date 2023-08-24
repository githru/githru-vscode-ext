import type { AuthorInfo } from "types";
import "./Author.scss";

const Author = ({ name, src }: AuthorInfo) => {
  return (
    <div
      className="author"
      data-tooltip-text={name}
    >
      <img
        src={src}
        alt=""
      />
    </div>
  );
};

export default Author;
