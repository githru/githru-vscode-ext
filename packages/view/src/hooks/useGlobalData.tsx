import type { Dispatch, ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

import type { ClusterNode } from "../types";
import { useGetTotalData } from "../App.hook";

type GlobalDataState = Partial<{
  data: ClusterNode[];
  filteredData: ClusterNode[];
  setFilteredData: Dispatch<ClusterNode[]>;
  selectedData: ClusterNode[];
  setSelectedData: Dispatch<ClusterNode[]>;
}>;

export const GlobalDataContext = createContext<GlobalDataState>(
  {} as GlobalDataState
);

export const GlobalDataProvider = ({ children }: { children: ReactNode }) => {
  const { data } = useGetTotalData();
  const [filteredData, setFilteredData] = useState<ClusterNode[]>(data);
  const [selectedData, setSelectedData] = useState<ClusterNode[]>([]);

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
