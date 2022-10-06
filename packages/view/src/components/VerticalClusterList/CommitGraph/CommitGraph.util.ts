import { CELL_HEIGHT, CELL_WIDTH, SVG_MARGIN } from "./CommitGraph.const";
import type {
  CommitDictionary,
  CommitGraphNode,
  LinkPosition,
} from "./CommitGraph.type";

export function commitGraphPosition(commitDict: CommitDictionary) {
  const branches: string[] = [];

  const getX = (index: number) => index * CELL_WIDTH + CELL_WIDTH / 2;
  const getY = (index: number) =>
    SVG_MARGIN.top + index * CELL_HEIGHT + CELL_HEIGHT / 2;

  const getPointPosition = (commits: CommitGraphNode[]) => {
    return commits.map((commit, i) => {
      const index = branches.indexOf(commit.stemId);

      const x = getX(branches.length);
      const y = getY(i);

      if (index >= 0) return { x: getX(index), y };

      branches.push(commit.stemId);

      return { x, y };
    });
  };

  const getVerticalLinkPosition = (commits: CommitGraphNode[]) => {
    if (branches.length <= 0) getPointPosition(commits);

    return commits.reduce((positions: LinkPosition[], commit, i) => {
      const childIndex = branches.indexOf(commit.stemId);
      const position = commit.parents.map((parent) => {
        const parentIndex = branches.indexOf(commitDict[parent].stemId);
        const index =
          commit.stemId !== parent && commit.parents.length > 1
            ? parentIndex
            : childIndex;
        return {
          x: [getX(index), getX(index)],
          y: [getY(i), getY(commitDict[parent].index)],
        };
      });
      return [...positions, ...position];
    }, []);
  };

  const getHorizontalLinkPosition = (commits: CommitGraphNode[]) => {
    if (branches.length <= 0) getPointPosition(commits);

    return commits.reduce((positions: LinkPosition[], commit, i) => {
      const childIndex = branches.indexOf(commit.stemId);
      const position = commit.parents.reduce(
        (result: LinkPosition[], parent) => {
          const parentIndex = branches.indexOf(commitDict[parent].stemId);
          const index =
            commit.stemId !== parent && commit.parents.length > 1
              ? i
              : commitDict[parent].index;
          return [
            ...result,
            {
              x: [getX(childIndex), getX(parentIndex)],
              y: [getY(index), getY(index)],
            },
          ];
        },
        []
      );
      return [...positions, ...position];
    }, []);
  };

  return {
    getPointPosition,
    getVerticalLinkPosition,
    getHorizontalLinkPosition,
  };
}
