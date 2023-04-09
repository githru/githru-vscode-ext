import type { AuthorProps } from "../Summary.type";

const Author = ({ name, src }: AuthorProps) => {
  return (
    <div className="name" data-tooltip-text={name}>
      <img src={src} alt="" width="30" />
    </div>
  );
};

export default Author;
