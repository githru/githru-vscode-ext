import { useState } from "react";

import type { CommitNode } from "types";

import { getSummaryCommitList } from "./Detail.util";

type UseToggleHook = [boolean, () => void];
const useToggleHook = (init = false): UseToggleHook => {
  const [toggle, setToggle] = useState(init);
  const handleToggle = () => setToggle((prev) => !prev);
  return [toggle, handleToggle];
};

export const useCommitListHide = (commitNodeListInCluster: CommitNode[]) => {
  const list = getSummaryCommitList(commitNodeListInCluster).reverse();
  const strech = commitNodeListInCluster.slice(5, commitNodeListInCluster.length).reverse();
  const [toggle, handleToggle] = useToggleHook();
  const commitNodeList = toggle ? [...list, ...strech] : list;

  return {
    toggle,
    handleToggle,
    commitNodeList,
  };
};
