import type {
  GlobalProps,
  CommitNode,
  ClusterNode,
  SelectedDataProps,
} from "types";

import type { Cluster } from "./Summary.type";

export function getInitData({ data }: GlobalProps) {
  const clusters: Cluster[] = [];

  data.map((clusterNode) => {
    const { message } = clusterNode.commitNodeList[0].commit;

    const resultMsg = message.split("/n/n")[0];
    const cluster: Cluster = {
      clusterId: clusterNode.commitNodeList[0].clusterId,
      summary: {
        authorNames: [],
        content: {
          message: resultMsg,
          count: clusterNode.commitNodeList.length - 1,
        },
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
    cluster.summary.authorNames.push(Array.from(authorsSet) as string[]);
    clusters.push(cluster);
    return cluster;
  });

  return clusters;
}

export function getClusterById(clusters: ClusterNode[], clusterId: number) {
  return clusters.filter(
    (cluster) => cluster.commitNodeList[0].clusterId === clusterId
  )[0];
}

export function getClusterIds(selectedData: SelectedDataProps) {
  if (!selectedData) return null;
  return selectedData.commitNodeList[0].clusterId;
}
