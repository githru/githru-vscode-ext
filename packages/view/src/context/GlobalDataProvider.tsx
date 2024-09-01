import type { PropsWithChildren } from "react";
import { useMemo, useState } from "react";

import { GlobalDataContext, type DateFilterRange } from "hooks";
import type { ClusterNode } from "types";
import { useLoadingStore } from "store";

export const GlobalDataProvider = ({ children }: PropsWithChildren) => {
  const [data, setData] = useState<ClusterNode[]>([]);
  const [filteredData, setFilteredData] = useState<ClusterNode[]>(data);
  const [selectedData, setSelectedData] = useState<ClusterNode[]>([]);
  const [filteredRange, setFilteredRange] = useState<DateFilterRange>(undefined);
  const { setLoading } = useLoadingStore((state) => state);
  const [branchList, setBranchList] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>(branchList?.[0]);
  const [owner, setOwner] = useState<string>("");
  const [repo, setRepo] = useState<string>("");

  const handleChangeBranchList = (branches: { branchList: string[]; head: string | null }) => {
    setSelectedBranch((prev) => (!prev && branches.head ? branches.head : prev));
    setBranchList(branches.branchList);
  };

  const handleChangeAnalyzedData = (analyzedData: ClusterNode[]) => {
    setData(analyzedData);
    setFilteredData([...analyzedData.reverse()]);
    setSelectedData([]);
    setLoading(false);
  };

  const value = useMemo(
    () => ({
      data,
      filteredRange,
      setFilteredRange,
      filteredData,
      setFilteredData,
      selectedData,
      setSelectedData,
      branchList,
      setBranchList,
      selectedBranch,
      setSelectedBranch,
      handleChangeAnalyzedData,
      handleChangeBranchList,
      owner,
      setOwner,
      repo,
      setRepo,
    }),
    [data, filteredRange, filteredData, selectedData, branchList, selectedBranch, owner, repo]
  );

  return <GlobalDataContext.Provider value={value}>{children}</GlobalDataContext.Provider>;
};
