import type { PropsWithChildren } from "react";
import { useCallback, useMemo, useState } from "react";

import { GlobalDataContext, type DateFilterRange } from "hooks";
import type { ClusterNode } from "types";

export const GlobalDataProvider = ({ children }: PropsWithChildren) => {
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<ClusterNode[]>([]);
  const [filteredData, setFilteredData] = useState<ClusterNode[]>(data);
  const [selectedData, setSelectedData] = useState<ClusterNode[]>([]);
  const [filteredRange, setFilteredRange] = useState<DateFilterRange>(undefined);

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

  /** Git Log 분할 로직 */
  // TODO : vscode 설정에서 처음 받아올 로그의 count를 설정한 후 주입하게 해도 됩니다.
  const [currentGitLogCount, setCurrentGitLogCount] = useState<number>(100);
  const handleChangeGitLogSkipCount = useCallback((newSkipCount: number) => {
    setCurrentGitLogCount((p) => p + newSkipCount);
  }, []);

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
      handleChangeAnalyzedData,
      handleChangeBranchList,
      owner,
      setOwner,
      repo,
      setRepo,
      currentGitLogCount,
      setCurrentGitLogCount,
      handleChangeGitLogSkipCount,
    }),
    [
      data,
      filteredRange,
      filteredData,
      selectedData,
      loading,
      branchList,
      selectedBranch,
      owner,
      repo,
      currentGitLogCount,
      handleChangeGitLogSkipCount,
    ]
  );

  return <GlobalDataContext.Provider value={value}>{children}</GlobalDataContext.Provider>;
};
