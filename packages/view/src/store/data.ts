import { create } from "zustand";
import type { Dispatch, SetStateAction } from "react";

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
  setSelectedData: Dispatch<SetStateAction<ClusterNode[]>>;
  setPagination: (isLastPage: boolean, nextCommitId?: string) => void;
};

export const useDataStore = create<DataState>((set) => ({
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
  setSelectedData: (selectedData) =>
    set((state) => ({
      selectedData: typeof selectedData === "function" ? selectedData(state.selectedData) : selectedData,
    })),
  setPagination: (isLastPage, nextCommitId) => set({ isLastPage, nextCommitId }),
}));
