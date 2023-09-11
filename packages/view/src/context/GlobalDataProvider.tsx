import type { PropsWithChildren } from "react";
import { useMemo, useState } from "react";

import { GlobalDataContext, type DateFilterRange } from "hooks";
import type { ClusterNode } from "types";

export const GlobalDataProvider = ({ children }: PropsWithChildren) => {
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<ClusterNode[]>([]);
  const [filteredData, setFilteredData] = useState<ClusterNode[]>(data);
  const [selectedData, setSelectedData] = useState<ClusterNode[]>([]);
  const [filteredRange, setFilteredRange] = useState<DateFilterRange>(undefined);

  const [branchList, setBranchList] = useState<string[]>([]);
  // TODO 초기에 base branch를 fetch해서 적용
  const [selectedBranch, setSelectedBranch] = useState<string>("main");

  const fetchBranchList = (branchList: string[]) => {
    setBranchList(branchList);
  };

  const fetchAnalyzedData = (analyzedData: ClusterNode[]) => {
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
      loading,
      setLoading,
      branchList,
      setBranchList,
      selectedBranch,
      setSelectedBranch,
      fetchAnalyzedData,
      fetchBranchList,
    }),
    [data, filteredRange, filteredData, selectedData, branchList, selectedBranch, loading]
  );

  return <GlobalDataContext.Provider value={value}>{children}</GlobalDataContext.Provider>;
};
