import type { GlobalProps, CommitNode } from "types";

import { authorBgColorArray } from "./Summary.const";
import type { Cluster } from "./Summary.type";

const colorName = [...authorBgColorArray];

export function getInitData({ data }: GlobalProps) {
  const clusters: Cluster[] = [];

  data.map((clusterNode) => {
    const cluster: Cluster = {
      clusterId: clusterNode.commitNodeList[0].clusterId,
      summary: {
        authorNames: [],
        keywords: [],
      },
    };

    clusterNode.commitNodeList.map((commitNode: CommitNode) => {
      // set names
      const authorSet: Set<string> = new Set();
      commitNode.commit.author.names.map((name) => {
        authorSet.add(name.trim());
        return name.trim();
      });

      cluster.summary.authorNames.push(Array.from(authorSet));

      // set keywords
      const keywordObject = {
        keyword: commitNode.commit.message.split(" ")[0],
        count: 1,
      };

      const findKeywordIndex = cluster.summary.keywords.findIndex(
        (key) => key.keyword === commitNode.commit.message.split(" ")[0]
      );

      if (findKeywordIndex === -1) cluster.summary.keywords.push(keywordObject);
      else {
        cluster.summary.keywords[findKeywordIndex].count += 1;
      }

      cluster.summary.keywords.sort((a, b) => b.count - a.count);

      return commitNode;
    });

    // remove name overlap
    const authorsSet = cluster.summary.authorNames.reduce(
      (set, authorArray) => {
        authorArray.forEach((author) => {
          set.add(author);
        });
        return set;
      },
      new Set()
    );

    cluster.summary.authorNames = [];

    cluster.summary.authorNames.push(Array.from(authorsSet) as Array<string>);

    clusters.push(cluster);

    return cluster;
  });

  return clusters;
}

export function getColorValue(name: string) {
  let result = "";

  const index =
    (name[0].charCodeAt(0) + name[1].charCodeAt(0)) % colorName.length;
  result = `#${colorName[index]}`;
  colorName.slice(0 + index, index + 1);

  return result;
}
