import type { Dispatch, ReactNode } from "react";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ClusterNode } from "types";

import { useGetTotalData } from "./useGetTotalData";

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
};

export const GlobalDataContext = createContext<GlobalDataState>(
  {} as GlobalDataState
);

export const GlobalDataProvider = ({ children }: { children: ReactNode }) => {
  const { data } = useGetTotalData();
  const [filteredData, setFilteredData] = useState<ClusterNode[]>(data);
  const [selectedData, setSelectedData] = useState<ClusterNode[]>([]);
  const [filteredRange, setFilteredRange] =
    useState<DateFilterRange>(undefined);

  useEffect(() => {
    console.log("data changed", data.length);
    setFilteredData(data.reverse());
  }, [data]);

  useEffect(() => {
    setSelectedData([]);
  }, [filteredData]);

  const value = useMemo(
    () => ({
      data,
      filteredRange,
      setFilteredRange,
      filteredData,
      setFilteredData,
      selectedData,
      setSelectedData,
    }),
    [data, filteredData, filteredRange, selectedData]
  );

  // if (!data.length || !filteredData.length) {
  //   console.log("???????");
  //   return null;
  // }

  // if (!data.length) {
  //   console.log("???????");
  //   return null;
  // }

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
