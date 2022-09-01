import { COMMIT_HEIGHT, NODE_GAP } from "./ClusterGraph.const";

export const getNumberOfCommit = (data: any) => {
  return data.map((node: any) => {
    return node.commitNodeList.length;
  });
};

export const getGraphHeight = (numOfCommit: any) => {
  const totalCommit = numOfCommit.reduce(
    (sum: number, commit: number) => sum + commit,
    0
  );
  return totalCommit * COMMIT_HEIGHT + (numOfCommit.length - 1) * NODE_GAP;
};
