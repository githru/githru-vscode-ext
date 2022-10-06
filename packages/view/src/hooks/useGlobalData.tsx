import type { Dispatch, ReactNode } from "react";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { CommitGraphNode } from "components/VerticalClusterList/CommitGraph/CommitGraph.type";
import type { ClusterNode } from "types";

import { useGetTotalData } from "./useGetTotalData";

type GlobalDataState = {
  data: ClusterNode[];
  commitGraphNodes: CommitGraphNode[];
  filteredData: ClusterNode[];
  selectedData: ClusterNode | null;
  setFilteredData: Dispatch<React.SetStateAction<ClusterNode[]>>;
  setSelectedData: Dispatch<React.SetStateAction<ClusterNode | null>>;
};

export const GlobalDataContext = createContext<GlobalDataState>(
  {} as GlobalDataState
);

export const GlobalDataProvider = ({ children }: { children: ReactNode }) => {
  const { data, commitGraphNodes } = useGetTotalData();
  const [filteredData, setFilteredData] = useState<ClusterNode[]>(data);
  const [selectedData, setSelectedData] = useState<ClusterNode | null>(null);

  useEffect(() => {
    setFilteredData(data.reverse());
  }, [data]);

  useEffect(() => {
    setSelectedData(null);
  }, [filteredData]);

  const value = useMemo(
    () => ({
      data,
      commitGraphNodes,
      filteredData,
      setFilteredData,
      selectedData,
      setSelectedData,
    }),
    [data, filteredData, selectedData]
  );
  if (!data.length || !filteredData.length) return null;

  return (
    <GlobalDataContext.Provider value={value}>
      {children}
    </GlobalDataContext.Provider>
  );
};

export const useGlobalData = () => {
  const globalData = useContext<GlobalDataState>(GlobalDataContext);
  return {
    ...globalData,
    data: globalData?.data ?? [],
    commitGraphNodes: globalData?.commitGraphNodes ?? [],
    filteredData: globalData?.filteredData ?? [],
    selectedData: globalData?.selectedData ?? null,
  };
};
