import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { ClusterNode } from "types";

type DataState = {
  data: ClusterNode[];
  filteredData: ClusterNode[];
  selectedData: ClusterNode[];
  setData: (data: ClusterNode[]) => void;
  setFilteredData: (filteredData: ClusterNode[]) => void;
  setSelectedData: (selectedData: ClusterNode[]) => void;
  toggleSelectedData: (selected: ClusterNode, clusterId: number) => void;
};

export const useDataStore = create<DataState>()(
  immer((set) => ({
    data: [],
    filteredData: [],
    selectedData: [],
    setData: (data) => set({ data }),
    setFilteredData: (filteredData) => set({ filteredData }),
    setSelectedData: (selectedData) => set({ selectedData }),
    toggleSelectedData: (selected: ClusterNode, clusterId: number) =>
      set((state) => {
        const selectedIndex = state.selectedData.findIndex((data) => data.commitNodeList[0].clusterId === clusterId);
        if (selectedIndex === -1) state.selectedData.push(selected);
        else state.selectedData.splice(selectedIndex, 1);
      }),
  }))
);
