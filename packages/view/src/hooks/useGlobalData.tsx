import type { Dispatch } from "react";
import type React from "react";
import { createContext, useContext } from "react";

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
  loading: boolean;
  setLoading: Dispatch<React.SetStateAction<boolean>>;
};

export const GlobalDataContext = createContext<GlobalDataState | undefined>(undefined);

export const useGlobalData = () => {
  const globalData = useContext(GlobalDataContext);
  if (!globalData) {
    throw new Error("Cannot find GlobalDataProvider");
  }

  return globalData;
};
