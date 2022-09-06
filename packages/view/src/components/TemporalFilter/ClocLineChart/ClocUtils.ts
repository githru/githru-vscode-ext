import type { ClusterNode } from "types/NodeTypes.temp";
import type { ClocType } from "./ClocType";
// import { CommitType } from "./CommitType";
// 데이터 가공 양식 => 커밋 날짜, diffStatistics.delations + diffStatistics.insertions
// diffStatistics.delations + diffStatistics.insertions은 total로 가공

export function TotalCommitNum(data: ClusterNode[]): ClocType[] {
  const TotalDict = {};

  data.forEach(({ commitNodeList }) => {
    commitNodeList.reduce((acc, { commit }) => {
      const Date = commit.commitDate[0];
      const { insertions, deletions } = commit.diffStatistics;

      if (!acc[Date]) {
        acc[Date] = { name: Date };
      }

      acc[Date] = {
        ...acc[Date],
        commit: (acc[Date].commit || 0) + 1,
        insertion: (acc[Date].insertion || 0) + insertions,
        deletion: (acc[Date].deletion || 0) + deletions,
        total: insertions + deletions,
      };

      return acc[Date].total;
    }, TotalDict);
  });

  return Object.values(TotalDict);
}
