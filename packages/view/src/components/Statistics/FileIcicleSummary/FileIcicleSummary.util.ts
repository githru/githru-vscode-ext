import type { ClusterNode } from "types";

import type {
  FileChanges,
  FileChangesMap,
  FileChangesNode,
  FileScoresMap,
} from "./FileIcicleSummary.type";

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

export const getFileScoresMap = (data: ClusterNode[]) => {
  if (!data.length) return {};

  return data
    .flatMap(({ commitNodeList }) => commitNodeList)
    .reduce(
      (map, { commit: { diffStatistics } }) =>
        Object.keys(diffStatistics.files).reduce(
          (acc, path) => ({
            ...acc,
            [path]: 1,
          }),
          map
        ),
      {} as FileScoresMap
    );
};

const visitFileNode = (
  node: FileChangesNode[],
  path: string,
  fileChanges: FileChanges,
  score: number
) => {
  // If file is in the root directory
  if (!path.includes("/")) {
    node.push({
      name: path,
      value: score,
      children: [],
      ...fileChanges,
    });
    return;
  }

  const [currentPath] = path.split("/");
  const subPath = path.substring(currentPath.length + 1);
  const currentNode = {
    name: currentPath,
    children: [],
  };

  // Use for-of loop to return early
  // eslint-disable-next-line no-restricted-syntax
  for (const { name, children } of node) {
    if (name === currentPath && children !== undefined) {
      visitFileNode(children, subPath, fileChanges, score);
      return;
    }
  }

  node.push(currentNode);
  visitFileNode(currentNode.children, subPath, fileChanges, score);
};

export const getFileChangesTree = (data: ClusterNode[]): FileChangesNode => {
  const fileChangesMap = getFileChangesMap(data);
  const fileScoresMap = getFileScoresMap(data);
  const root: FileChangesNode = {
    name: "root",
    children: [],
  };

  Object.entries(fileChangesMap).forEach(([path, fileChanges]) =>
    visitFileNode(root.children, path, fileChanges, fileScoresMap[path])
  );

  return root;
};
