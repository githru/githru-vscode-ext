import md5 from "md5";

import type { AuthorInfo } from "types";

import { GITHUB_URL, GRAVATA_URL } from "../constants/constants";

export function getAuthorProfileImgSrc(
  authorName: string
): Promise<AuthorInfo> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const { src } = img;
      const srcInfo: AuthorInfo = {
        name: authorName,
        src,
      };
      resolve(srcInfo);
    };

    img.onerror = () => {
      img.src = `${GRAVATA_URL}/${md5(authorName)}}?d=identicon&f=y`;
    };

    img.src = `${GITHUB_URL}/${authorName}.png?size=30`;
  });
}
