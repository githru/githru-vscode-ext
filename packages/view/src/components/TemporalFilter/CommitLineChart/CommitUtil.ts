import type { ClusterNode } from "types/NodeTypes.temp";
// import type { CommitType } from "./CommitType";
import { CommitH } from "./Const";
// import { CommitType } from "./CommitType";

//   console.log(data[7].commit.commitDate);
// 데이터 가공 양식 => 커밋수, 커밋 날짜
// 커밋 수 세기, 커밋 날짜 paring가공

export function CommitNum(data: ClusterNode[]) {
  return data.map((node) => node.commitNodeList.length);
}

export function TotalCommit(commitCounts: number[]) {
  const totalCommit = commitCounts.reduce(
    (sum: number, commit: number) => sum + commit,
    0
  );
  return totalCommit * CommitH + commitCounts.length;
}

export function DateSort(data: ClusterNode[]) {
  // 샘플 데이터 예시(임의로)
  // 7: {Date: '2018-11-05T09:52:57.000Z', commit: 5,}
  // 14: {Date: '2018-11-06T22:36:21.000Z', commit: 7}
  // 30: {Date: '2019-04-10T11:24:21.000Z', commit: 10}
  const usedData: ClusterNode[] = [data[7], data[14], data[30]];
  return usedData.sort();
  //   usedData.sort();
}
