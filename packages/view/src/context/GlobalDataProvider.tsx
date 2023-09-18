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
  const [baseBranch, setBaseBranch] = useState<string>(branchList?.[0]);

  const handleChangeBranchList = (branches: { branchList: string[]; head: string | null }) => {
    setBaseBranch((prev) => (!prev && branches.head ? branches.head : prev));
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
      loading,
      setLoading,
      branchList,
      setBranchList,
      baseBranch,
      setBaseBranch,
      handleChangeAnalyzedData,
      handleChangeBranchList,
    }),
    [data, filteredRange, filteredData, selectedData, branchList, baseBranch, loading]
  );

  return <GlobalDataContext.Provider value={value}>{children}</GlobalDataContext.Provider>;
};
