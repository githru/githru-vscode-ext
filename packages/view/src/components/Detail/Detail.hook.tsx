import { useState, useCallback, useMemo } from "react";
import { CellMeasurerCache } from "react-virtualized";
import type { RenderedRows } from "react-virtualized/dist/es/List";

import type { CommitNode } from "types";

import type { VirtualizedItem } from "./Detail.type";
import { getSummaryCommitList } from "./Detail.util";

type UseToggleHook = [boolean, () => void];
const useToggleHook = (init = false): UseToggleHook => {
  const [toggle, setToggle] = useState(init);
  const handleToggle = () => setToggle((prev) => !prev);
  return [toggle, handleToggle];
};

export const useCommitListHide = (commitNodeListInCluster: CommitNode[]) => {
  const list = getSummaryCommitList(commitNodeListInCluster);
  const stretch = commitNodeListInCluster;
  const [toggle, handleToggle] = useToggleHook();
  const commitNodeList = toggle ? stretch : list;

  return {
    toggle,
    handleToggle,
    commitNodeList,
  };
};

export const useVirtualizedList = (commitNodeListInCluster: CommitNode[]) => {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  const cache = useMemo(
    () =>
      new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 120,
      }),
    []
  );

  const virtualizedItems = useMemo((): VirtualizedItem[] => {
    const items: VirtualizedItem[] = [];

    items.push({
      type: "summary",
      data: commitNodeListInCluster,
    });

    commitNodeListInCluster.forEach(({ commit }) => {
      items.push({
        type: "commit",
        data: commit,
      });
    });

    return items;
  }, [commitNodeListInCluster]);

  // scrollable indicator handler
  const handleRowsRendered = useCallback(
    ({ stopIndex }: RenderedRows) => {
      const lastIndex = virtualizedItems.length - 1;
      setShowScrollIndicator(stopIndex < lastIndex);
    },
    [virtualizedItems.length]
  );

  return {
    cache,
    virtualizedItems,
    showScrollIndicator,
    handleRowsRendered,
  };
};
