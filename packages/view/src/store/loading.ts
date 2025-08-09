import { create } from "zustand";

type LoadingState = {
  loading: boolean;
  setLoading: (loading: boolean) => void;

  isBranchLoading: boolean;
  setIsBranchLoading: (loading: boolean) => void;
};

export const useLoadingStore = create<LoadingState>((set) => ({
  loading: false,
  setLoading: (loading) => set({ loading }),

  isBranchLoading: false,
  setIsBranchLoading: (loading) => set({ isBranchLoading: loading }),
}));
