import { create } from "zustand";

export type DateFilterRange =
  | {
      fromDate: string;
      toDate: string;
    }
  | undefined;

type FilteredRangeStore = {
  filteredRange: DateFilterRange;
  setFilteredRange: (filteredRange: DateFilterRange) => void;
};

export const useFilteredRangeStore = create<FilteredRangeStore>((set) => ({
  filteredRange: undefined,
  setFilteredRange: (filteredRange) => set({ filteredRange }),
}));
