import { useState } from "react";

import type { CommitNode } from "types";

import { take } from "./Detail.util";

type UseToggleHook = [boolean, () => void];
const useToggleHook = (init = false): UseToggleHook => {
  const [toggle, setToggle] = useState(init);
  const handleToggle = () => setToggle((prev) => !prev);
  return [toggle, handleToggle];
};

export const useCommitListHide = (commitNodeListInCluster: CommitNode[]) => {
  const list = take(5, commitNodeListInCluster);
  const strech = commitNodeListInCluster
    .slice(0, commitNodeListInCluster.length - 5)
    .reverse();
  const [toggle, handleToggle] = useToggleHook();
  const commitNodeList = toggle ? [...list, ...strech] : list;

  return {
    toggle,
    handleToggle,
    commitNodeList,
  };
};
