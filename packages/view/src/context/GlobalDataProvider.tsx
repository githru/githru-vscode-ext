import type { PropsWithChildren } from "react";
import { useMemo, useState } from "react";

import { GlobalDataContext } from "hooks";
import type { ClusterNode } from "types";
import { useLoadingStore } from "store";

export const GlobalDataProvider = ({ children }: PropsWithChildren) => {
  const [data, setData] = useState<ClusterNode[]>([]);
  const [filteredData, setFilteredData] = useState<ClusterNode[]>(data);
  const [selectedData, setSelectedData] = useState<ClusterNode[]>([]);
  const { setLoading } = useLoadingStore();
  const [owner, setOwner] = useState<string>("");
  const [repo, setRepo] = useState<string>("");

  const handleChangeAnalyzedData = (analyzedData: ClusterNode[]) => {
    setData(analyzedData);
    setFilteredData([...analyzedData.reverse()]);
    setSelectedData([]);
    setLoading(false);
  };

  const value = useMemo(
    () => ({
      data,
      filteredData,
      setFilteredData,
      selectedData,
      setSelectedData,
      handleChangeAnalyzedData,
      owner,
      setOwner,
      repo,
      setRepo,
    }),
    [data, filteredData, selectedData, owner, repo]
  );

  return <GlobalDataContext.Provider value={value}>{children}</GlobalDataContext.Provider>;
};
