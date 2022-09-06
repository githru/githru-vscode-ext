import type { GlobalProps, CommitNode } from "types/";

type GetTargetCommit = GlobalProps & { id: string };

export const getTargetCommit = ({ data, id }: GetTargetCommit) => {
  if (data?.length === 0) return undefined;
  const flatCommitNode: CommitNode[] = data
    .map((clusterNode) => clusterNode.commitNodeList)
    .flat();
  const [target] = flatCommitNode.filter(
    (commitNode) => commitNode.commit.id === id
  );

  // parent Commit 추출하기
  // const parentCommitId = target.commit.parentIds;
  // console.log(parentCommitId);
  // const parentCommits = parentCommitId.map((parentId) =>
  //   flatCommitNode.filter(commitNode => commitNode.commit.id === parentId)
  // );
  // console.log(parentCommits);

  // 동일한 Cluster Commit 추출하기
  // const { taskId: ClusterId } = target;
  // const clusterCommits = flatCommitNode.filter(
  //   (commitNode) => commitNode.taskId === ClusterId
  // );
  // console.log(clusterCommits);
  return target?.commit;
};

export const getTime = (date: Date) =>
  String(date).split(".")[0].replace("T", " ");
