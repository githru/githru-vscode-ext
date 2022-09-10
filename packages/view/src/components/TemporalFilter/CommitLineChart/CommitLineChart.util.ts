// import type { ClusterNode } from "types/NodeTypes.temp";
// import type { CommitType } from "./CommitType";
import { COMMIT_HEIGHT } from "./CommitLineChart.const";
import type { CommitNode } from "../Type/TemporalFilter.type";
// import { CommitType } from "./CommitType";

//   console.log(data[7].commit.commitDate);
// 데이터 가공 양식 => 커밋수, 커밋 날짜
// 커밋 수 세기, 커밋 날짜 paring가공

export function CommitNum(data: CommitNode[]) {
  return data.map((node) => node.commit);
}

export function TotalCommit(commitCounts: number[]) {
  const totalCommit = commitCounts.reduce(
    (sum: number, commit: number) => sum + commit,
    0
  );
  return totalCommit * COMMIT_HEIGHT + commitCounts.length;
}
