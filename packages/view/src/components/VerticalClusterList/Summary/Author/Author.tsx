import { useState } from "react";
import md5 from "md5";

import type { AuthorProps } from "../Summary.type";
import { GITHUB_URL, GRAVATA_URL } from "../Summary.const";

const Author = ({ name }: AuthorProps) => {
  const src = `${GITHUB_URL}/${name}.png`;
  const fallback = `${GRAVATA_URL}/${md5(name)}?d=identicon&f=y`;

  const [imgSrc, setImgSrc] = useState<string>(src);
  const onError = () => setImgSrc(fallback);

  return (
    <div className="name" data-tooltip-text={name}>
      <img src={imgSrc} onError={onError} alt="" />
    </div>
  );
};

export default Author;
