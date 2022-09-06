import { nanoid } from "nanoid";

import type { GlobalProps, CommitNode } from "types";

import type { Cluster, Commit } from "./Summary.type";

export function getInitData({ data }: GlobalProps) {
  const clusters: Cluster[] = [];

  data.map((clusterNode) => {
    const cluster: Cluster = {
      id: nanoid(),
      commits: [],
    };

    const commitArray: Commit[] = [];

    clusterNode.commitNodeList.map((commitNode: CommitNode) => {
      const temp = {
        commitId: commitNode.commit.id,
        authorNames: commitNode.commit.author.names.map((name) => ({
          id: nanoid(),
          name: name.trim(),
        })),
        message: commitNode.commit.message,
      };

      commitArray.push(temp);

      cluster.commits = commitArray;

      return temp;
    });

    clusters.push(cluster);
    return cluster;
  });

  return clusters;
}
