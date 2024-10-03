import { create } from "zustand";
import type { Dispatch, SetStateAction } from "react";

import type { ClusterNode } from "types";

interface DataState {
  data: ClusterNode[];
  filteredData: ClusterNode[];
  selectedData: ClusterNode[];
  setData: (data: ClusterNode[]) => void;
  setFilteredData: (filteredData: ClusterNode[]) => void;
  setSelectedData: Dispatch<SetStateAction<ClusterNode[]>>;
}

export const useDataStore = create<DataState>((set) => ({
  data: [],
  filteredData: [],
  selectedData: [],
  setData: (data) => set({ data }),
  setFilteredData: (filteredData) => set({ filteredData }),
  setSelectedData: (selectedData) =>
    set((state) => ({
      selectedData: typeof selectedData === "function" ? selectedData(state.selectedData) : selectedData,
    })),
}));
