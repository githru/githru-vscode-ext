import type { Dispatch, ReactNode } from "react";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ClusterNode } from "../types";

import { useGetTotalData } from "./useGetTotalData";

type GlobalDataState = {
  data: ClusterNode[];
  filteredData: ClusterNode[];
  selectedData: ClusterNode | null;
  setFilteredData: Dispatch<React.SetStateAction<ClusterNode[]>>;
  setSelectedData: Dispatch<React.SetStateAction<ClusterNode | null>>;
};

export const GlobalDataContext = createContext<GlobalDataState>(
  {} as GlobalDataState
);

export const GlobalDataProvider = ({ children }: { children: ReactNode }) => {
  const { data } = useGetTotalData();
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
    filteredData: globalData?.filteredData ?? [],
    selectedData: globalData?.selectedData ?? null,
  };
};
