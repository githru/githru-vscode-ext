import type { ClusterNode } from "types/NodeTypes.temp";
import type { ClocType } from "../ClocLineChart/ClocType";
// import { CommitType } from "./CommitType";
// 데이터 가공 양식 => 커밋 날짜, diffStatistics.delations + diffStatistics.insertions
// diffStatistics.delations + diffStatistics.insertions은 total로 가공

export function TotalCommitNum(data: ClusterNode[]): ClocType[] {
  const TotalDict = {};

  data.forEach(({ commitNodeList }) => {
    commitNodeList.reduce((arr, { commit }) => {
      const Date = commit.commitDate[0];
      const { insertions, deletions } = commit.diffStatistics;

      if (!arr[Date]) {
        arr[Date] = { name: Date };
      }

      arr[Date] = {
        ...arr[Date],
        commit: (arr[Date].commit || 0) + 1,
        insertion: (arr[Date].insertion || 0) + insertions,
        deletion: (arr[Date].deletion || 0) + deletions,
        total: insertions + deletions,
      };

      return arr[Date].total;
    }, TotalDict);
  });

  return Object.values(TotalDict);
}
