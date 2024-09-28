import type { Dispatch, SetStateAction } from "react";
import { createContext, useContext } from "react";

import type { ClusterNode } from "types";

type GlobalDataState = {
  data: ClusterNode[];
  filteredData: ClusterNode[];
  selectedData: ClusterNode[];
  setFilteredData: Dispatch<SetStateAction<ClusterNode[]>>;
  setSelectedData: Dispatch<SetStateAction<ClusterNode[]>>;
  owner: string;
  setOwner: Dispatch<SetStateAction<string>>;
  repo: string;
  setRepo: Dispatch<SetStateAction<string>>;
  handleChangeAnalyzedData: (analyzedData: ClusterNode[]) => void;
}; // handleChangeBranchList를 임시로 제외 -> 추후 GlobalDataContext를 삭제할 예정

export const GlobalDataContext = createContext<GlobalDataState | undefined>(undefined);

export const useGlobalData = () => {
  const globalData = useContext(GlobalDataContext);
  if (!globalData) {
    throw new Error("Cannot find GlobalDataProvider");
  }

  return globalData;
};
