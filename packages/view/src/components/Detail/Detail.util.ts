import type { GlobalProps, CommitNode } from "types/";

type GetCommitListInCluster = GlobalProps & { clusterId: number };
export const getCommitListInCluster = ({
  data,
  clusterId,
}: GetCommitListInCluster) => {
  const flatCommitNodeList: CommitNode[] = data
    .map((clusterNode) => clusterNode.commitNodeList)
    .flat();

  const commitNodeListInCluster = flatCommitNodeList.filter(
    (commitNode) => commitNode.clusterId === clusterId
  );
  return commitNodeListInCluster;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getDataSetSize = <T extends any[]>(arr: T, callback: Function) => {
  const set = new Set();
  const fn = callback(set);
  arr.forEach(fn);
  return set.size;
};

type GetCommitListAuthorLength = GetCommitListDetail;
const getCommitListAuthorLength = ({
  commitNodeListInCluster,
}: GetCommitListAuthorLength) => {
  const fn =
    (set: Set<string>) =>
    ({
      commit: {
        author: { names },
      },
    }: CommitNode) =>
      names.forEach((name) => set.add(name));
  return getDataSetSize(commitNodeListInCluster, fn);
};

type GetChangeFileLength = GetCommitListDetail;
const getChangeFileLength = ({
  commitNodeListInCluster,
}: GetChangeFileLength) => {
  const fn =
    (set: Set<string>) =>
    ({
      commit: {
        diffStatistics: { files },
      },
    }: CommitNode) =>
      Object.keys(files).forEach((file) => set.add(file));
  return getDataSetSize(commitNodeListInCluster, fn);
};

const numAddCommar = (num: number) =>
  num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

type ObjAddCommarProps = {
  authorLength: number;
  fileLength: number;
  commitLength: number;
  insertions: number;
  deletions: number;
};
type ObjAddCommarReturn = { [key in keyof ObjAddCommarProps]: string };
const objAddCommar = (obj: ObjAddCommarProps): ObjAddCommarReturn =>
  Object.entries(obj).reduce((acc, [k, v]) => {
    return {
      ...acc,
      [k]: numAddCommar(v),
    };
  }, {}) as ObjAddCommarReturn;

type GetCommitListDetail = { commitNodeListInCluster: CommitNode[] };
export const getCommitListDetail = ({
  commitNodeListInCluster,
}: GetCommitListDetail) => {
  const authorLength = getCommitListAuthorLength({ commitNodeListInCluster });
  const fileLength = getChangeFileLength({ commitNodeListInCluster });
  const diffStatistics = commitNodeListInCluster.reduce(
    (acc, { commit: { diffStatistics: cur } }) => ({
      insertions: acc.insertions + cur.insertions,
      deletions: acc.deletions + cur.deletions,
    }),
    {
      insertions: 0,
      deletions: 0,
    }
  );
  return objAddCommar({
    authorLength,
    fileLength,
    commitLength: commitNodeListInCluster.length,
    ...diffStatistics,
  });
};
