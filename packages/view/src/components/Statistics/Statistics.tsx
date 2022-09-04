import type { DifferenceStatistic } from "@githru-vscode-ext/analysis-engine/src/types";

const mockDifferenceStatistic: DifferenceStatistic = {
  totalInsertionCount: 300,
  totalDeletionCount: 100,
  fileDictionary: {
    "./a": {
      insertionCount: 140,
      deletionCount: 30,
    },
    "./b": {
      insertionCount: 160,
      deletionCount: 70,
    },
  },
};

const Statistics = () => {
  return (
    <div>{mockDifferenceStatistic.fileDictionary["./a"].insertionCount}</div>
  );
};

export default Statistics;
