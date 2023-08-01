import type { AuthorProps } from "../Summary.type";
import "./Author.scss";

const Author = ({ name, src }: AuthorProps) => {
  return (
    <div className="author" data-tooltip-text={name}>
      <img src={src} alt="" width="30" />
    </div>
  );
};

export default Author;
