import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { ClusterNode } from "types";

type DataState = {
  data: ClusterNode[];
  filteredData: ClusterNode[];
  selectedData: ClusterNode[];
  isLastPage: boolean;
  nextCommitId?: string;
  setData: (data: ClusterNode[]) => void;
  addData: (newData: ClusterNode[]) => void;
  setFilteredData: (filteredData: ClusterNode[]) => void;
  setSelectedData: (selectedData: ClusterNode[]) => void;
  toggleSelectedData: (selected: ClusterNode, clusterId: number) => void;
  setPagination: (isLastPage: boolean, nextCommitId?: string) => void;
};

export const useDataStore = create<DataState>()(
  immer((set) => ({
    data: [],
    filteredData: [],
    selectedData: [],
    isLastPage: false,
    nextCommitId: undefined,
    setData: (data) => set({ data }),
    addData: (newData) =>
      set((state) => ({
        data: [...state.data, ...newData],
        filteredData: [...state.filteredData, ...newData],
      })),
    setFilteredData: (filteredData) => set({ filteredData }),
    setSelectedData: (selectedData) => set({ selectedData }),
    toggleSelectedData: (selected: ClusterNode, clusterId: number) =>
      set((state) => {
        const selectedIndex = state.selectedData.findIndex((data) => data.commitNodeList[0].clusterId === clusterId);
        if (selectedIndex === -1) state.selectedData.push(selected);
        else state.selectedData.splice(selectedIndex, 1);
      }),
    setPagination: (isLastPage, nextCommitId) => set({ isLastPage, nextCommitId }),
  }))
);
