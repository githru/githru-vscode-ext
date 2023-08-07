import type { AuthorInfo } from "types";
import "./Author.scss";

const Author = ({ name, src }: AuthorInfo) => {
  return (
    <div className="author" data-tooltip-text={name}>
      <img src={src} alt="" width="30" />
    </div>
  );
};

export default Author;
