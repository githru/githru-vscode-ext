import type { Dispatch, ReactNode } from "react";
import React, { createContext, useContext, useMemo, useState } from "react";

import type { ClusterNode } from "types";

export type DateFilterRange =
  | {
      fromDate: string;
      toDate: string;
    }
  | undefined;

type GlobalDataState = {
  data: ClusterNode[];
  filteredRange: DateFilterRange;
  filteredData: ClusterNode[];
  selectedData: ClusterNode[];
  setFilteredData: Dispatch<React.SetStateAction<ClusterNode[]>>;
  setSelectedData: Dispatch<React.SetStateAction<ClusterNode[]>>;
  setFilteredRange: Dispatch<React.SetStateAction<DateFilterRange>>;
  fetchAnalyzedData: (analyzedData: ClusterNode[]) => void;
};

export const GlobalDataContext = createContext<GlobalDataState>(
  {} as GlobalDataState
);

export const GlobalDataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<ClusterNode[]>([]);
  const [filteredData, setFilteredData] = useState<ClusterNode[]>(data);
  const [selectedData, setSelectedData] = useState<ClusterNode[]>([]);
  const [filteredRange, setFilteredRange] =
    useState<DateFilterRange>(undefined);

  const fetchAnalyzedData = (analyzedData: ClusterNode[]) => {
    setData(analyzedData);
    setFilteredData([...analyzedData]);
    setSelectedData([]);
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
      fetchAnalyzedData,
    }),
    [data, filteredRange, filteredData, selectedData]
  );

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
