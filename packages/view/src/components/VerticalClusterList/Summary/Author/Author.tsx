import { useRef } from "react";
import md5 from "md5";

import type { AuthorProps } from "../Summary.type";
import { GITHUB_URL, GRAVATA_URL } from "../Summary.const";

const Author = ({ name }: AuthorProps) => {
  const src = `${GITHUB_URL}/${name}.png?size=30`;
  const fallback = `${GRAVATA_URL}/${md5(name)}?d=identicon&f=y`;
  const imgRef = useRef<HTMLImageElement>(null);

  const onError = () => {
    if (imgRef.current) imgRef.current.src = fallback;
  };

  return (
    <div className="name" data-tooltip-text={name}>
      <img ref={imgRef} src={src} onError={onError} alt="profileImage" />
    </div>
  );
};

export default Author;
