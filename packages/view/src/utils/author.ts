import md5 from "md5";

import { GITHUB_URL, GRAVATA_URL } from "constants/constants";
import type { SrcInfo } from "types";

export function getAuthorProfileImgSrc(authorName: string): Promise<SrcInfo> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const { src } = img;
      const srcInfo: SrcInfo = {
        key: authorName,
        value: src,
      };
      resolve(srcInfo);
    };

    img.onerror = () => {
      img.src = `${GRAVATA_URL}/${md5(authorName)}}?d=identicon&f=y`;
    };

    img.src = `${GITHUB_URL}/${authorName}.png?size=30`;
  });
}
