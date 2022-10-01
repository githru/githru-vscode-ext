import type { Dispatch, ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { ClusterNode } from "../types";
import { useGetTotalData } from "../App.hook";

type GlobalDataState = Partial<{
  data: ClusterNode[];
  filteredData: ClusterNode[];
  setFilteredData: Dispatch<ClusterNode[]>;
  selectedData: ClusterNode | null;
  setSelectedData: Dispatch<ClusterNode | null>;
}>;

export const GlobalDataContext = createContext<GlobalDataState>(
  {} as GlobalDataState
);

export const GlobalDataProvider = ({ children }: { children: ReactNode }) => {
  const { data } = useGetTotalData();
  const [filteredData, setFilteredData] = useState<ClusterNode[]>(data);
  const [selectedData, setSelectedData] = useState<ClusterNode | null>(null);

  // useEffect(() => {
  //   setSelectedData([]);
  // }, [filteredData]);
  useEffect(() => {
    setFilteredData(data);
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
  return globalData;
};
