import * as d3 from "d3";
import md5 from "md5";

import type { ClusterNode, CommitNode } from "types";

import { GITHUB_URL, GRAVATA_URL } from "../../../constants/constants";

import type { AuthorDataObj, AuthorDataType, SrcInfo } from "./AuthorBarChart.type";

export const getDataByAuthor = (data: ClusterNode[]): AuthorDataType[] => {
  if (!data.length) return [];

  const authorDataObj: AuthorDataObj = {};

  data.forEach(({ commitNodeList }) => {
    commitNodeList.forEach(({ commit }) => {
      const author = commit.author.names[0];
      const { insertions, deletions } = commit.diffStatistics;

      if (!authorDataObj[author]) {
        authorDataObj[author] = {
          name: author,
          commit: 1,
          insertion: insertions,
          deletion: deletions,
        };
      } else {
        authorDataObj[author] = {
          ...authorDataObj[author],
          commit: (authorDataObj[author].commit || 0) + 1,
          insertion: (authorDataObj[author].insertion || 0) + insertions,
          deletion: (authorDataObj[author].deletion || 0) + deletions,
        };
      }
    });
  });

  return Object.values(authorDataObj);
};

export const sortDataByName = (a: string, b: string) => {
  const nameA = a.toUpperCase();
  const nameB = b.toUpperCase();

  if (nameA < nameB) return 1;
  if (nameA > nameB) return -1;
  return 0;
};

export const convertNumberFormat = (d: number | { valueOf(): number }): string => {
  if (typeof d === "number" && d < 1 && d >= 0) {
    return `${d}`;
  }
  return d3.format("~s")(d);
};

export const sortDataByAuthor = (data: ClusterNode[], author: string): ClusterNode[] => {
  return data.reduce((acc: ClusterNode[], cluster: ClusterNode) => {
    const checkedCluster = cluster.commitNodeList.filter((commitNode: CommitNode) =>
      commitNode.commit.author.names.includes(author)
    );
    if (!checkedCluster.length) return acc;
    return [...acc, { nodeTypeName: "CLUSTER" as const, commitNodeList: checkedCluster }];
  }, []);
};

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
      const fallback = `${GRAVATA_URL}/${md5(authorName)}}?d=identicon&f=y`;

      resolve({
        key: authorName,
        value: fallback,
      });
    };

    const src = `${GITHUB_URL}/${authorName}.png?size=30`;
    img.src = src;
  });
}
