import type { ClusterNode } from "types/NodeTypes.temp";

import type { CommitNode } from "./TemporalFilter.type";

export function sortBasedOnCommitNode(data: ClusterNode[]): CommitNode[] {
  const sortedData: CommitNode[] = [];
  data.forEach((cluster) => {
    cluster.commitNodeList.map((commitNode) => sortedData.push(commitNode));
  });

  return Array.from(
    sortedData.sort((a, b) => {
      return a.commit.commitDate > b.commit.commitDate ? 1 : -1;
    })
  );
}
