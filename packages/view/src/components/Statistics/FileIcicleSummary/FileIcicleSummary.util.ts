import type { ClusterNode } from "../../../types";

import type { FileChangesMap } from "./FileIcicleSummary.type";

export const getFileChangesMap = (data: ClusterNode[]): FileChangesMap => {
  if (!data.length) return {};

  return data
    .flatMap(({ commitNodeList }) => commitNodeList)
    .reduce(
      (map, { commit: { diffStatistics } }) =>
        Object.entries(diffStatistics.files).reduce(
          (acc, [path, { insertions, deletions }]) => ({
            ...acc,
            [path]: {
              insertions: (acc[path]?.insertions ?? 0) + insertions,
              deletions: (acc[path]?.deletions ?? 0) + deletions,
              commits: (acc[path]?.commits ?? 0) + 1,
            },
          }),
          map
        ),
      {} as FileChangesMap
    );
};
