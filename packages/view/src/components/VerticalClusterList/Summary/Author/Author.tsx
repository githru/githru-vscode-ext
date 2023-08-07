import type { AuthorInfo } from "types";

const Author = ({ name, src }: AuthorInfo) => {
  return (
    <div className="name" data-tooltip-text={name}>
      <img src={src} alt="" width="30" />
    </div>
  );
};

export default Author;
