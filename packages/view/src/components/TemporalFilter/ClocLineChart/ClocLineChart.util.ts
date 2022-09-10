/* eslint-disable */

// import type { ClusterNode } from "types/NodeTypes.temp";
// import type { ClocType } from "./ClocType";
// import { CommitType } from "./CommitType";
import type { CommitNode } from "../Type/TemporalFilter.type";
// 데이터 가공 양식 => 커밋 날짜, diffStatistics.delations + diffStatistics.insertions
// diffStatistics.delations + diffStatistics.insertions은 total로 가공

export function getDiffStatisticsArray(data: CommitNode[]): number[] {
  // 결과
  const diffStatisticsArray: number[] = [];

  // 순환하면서 더해주기
  data.forEach((commit: CommitNode) => {
    const diffStatistics = commit.commit.diffStatistics;
    const insertions = diffStatistics.insertions;
    const deletions = diffStatistics.deletions;

    diffStatisticsArray.push(insertions - deletions);
  });

  return diffStatisticsArray;

  // const TotalDict = {};

  // data.forEach(({ commit:diffStatistics }) => {
  //   diffStatistics.diffStatistics((acc, { commit }) => {
  //     const Date = commit.commitDate[0];
  // const { insertions, deletions } = commit.diffStatistics;

  //     if (!acc[Date]) {
  //       acc[Date] = { name: Date };
  //     }

  //     acc[Date] = {
  //       ...acc[Date],
  //       commit: (acc[Date].commit || 0) + 1,
  //       insertion: (acc[Date].insertion || 0) + insertions,
  //       deletion: (acc[Date].deletion || 0) + deletions,
  //       total: insertions + deletions,
  //     };

  //     return acc[Date].total;
  //   }, TotalDict);
  // });

  // return Object.values(TotalDict);
}
