import { nanoid } from "nanoid";
import type { GlobalProps } from "types/global";

import type { CommitNode } from "types/NodeTypes.temp";

import type { Cluster, Commit, Author } from ".";

export function getInitData({ data }: GlobalProps) {
  const clusters: Cluster[] = [];

  data.map((clusterNode) => {
    const cluster: Cluster = {
      id: nanoid(),
      commits: [],
    };

    const commitArray: Commit[] = [];

    clusterNode.commitNodeList.map((commitNode: CommitNode) => {
      const authors: Author[] = [];

      commitNode.commit.author.names.map((name) => {
        const author: Author = {
          id: nanoid(),
          name: name.trim(),
        };
        authors.push(author);

        return author;
      });

      const temp = {
        commitId: commitNode.commit.id,
        authorNames: authors,
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
