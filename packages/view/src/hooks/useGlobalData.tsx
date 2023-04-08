import type { Dispatch, ReactNode } from "react";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ClusterNode, VSMessageEvent } from "types";

import fakeData from "../fake-assets/cluster-nodes.json";

export type DateFilterRange =
  | {
      fromDate: string;
      toDate: string;
    }
  | undefined;

type GlobalDataState = {
  data: ClusterNode[];
  setData: Dispatch<React.SetStateAction<ClusterNode[]>>;
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
  const [data, setData] = useState<ClusterNode[]>([]);
  const [filteredData, setFilteredData] = useState<ClusterNode[]>(data);
  const [selectedData, setSelectedData] = useState<ClusterNode[]>([]);
  const [filteredRange, setFilteredRange] =
    useState<DateFilterRange>(undefined);

  useEffect(() => {
    if (window.isProduction) {
      setData(window.githruData as ClusterNode[]);
      setFilteredData([...(window.githruData as ClusterNode[])]);
    } else {
      setData(fakeData as unknown as ClusterNode[]);
      setFilteredData(([...fakeData] as unknown as ClusterNode[]).reverse());
    }

    const onReceiveClusterNodes = (e: VSMessageEvent): void => {
      if (e.data.command !== "refresh") return;

      const newData = JSON.parse(e.data.payload);
      setData(newData);
      setFilteredRange(undefined);
      setFilteredData([...newData].reverse());
      setSelectedData([]);
    };
    window.addEventListener("message", onReceiveClusterNodes);

    return () => window.removeEventListener("message", onReceiveClusterNodes);
  }, []);

  const value = useMemo(
    () => ({
      data,
      setData,
      filteredRange,
      setFilteredRange,
      filteredData,
      setFilteredData,
      selectedData,
      setSelectedData,
    }),
    [data, setData, filteredData, filteredRange, selectedData]
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
