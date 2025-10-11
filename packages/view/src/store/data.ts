import type { Dispatch, SetStateAction } from "react";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { ClusterNode } from "types";

type DataState = {
  data: ClusterNode[];
  filteredData: ClusterNode[];
  selectedData: ClusterNode[];
  setData: (data: ClusterNode[]) => void;
  setFilteredData: (filteredData: ClusterNode[]) => void;
  setSelectedData: Dispatch<SetStateAction<ClusterNode[]>>;
};

export const useDataStore = create<DataState>()(
  immer((set) => ({
    data: [],
    filteredData: [],
    selectedData: [],
    setData: (data) => set({ data }),
    setFilteredData: (filteredData) => set({ filteredData }),
    setSelectedData: (selectedData) =>
      set((state) => {
        state.selectedData = typeof selectedData === "function" ? selectedData(state.selectedData) : selectedData;
      }),
  }))
);
