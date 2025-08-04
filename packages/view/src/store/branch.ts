import { create } from "zustand";

import { useLoadingStore } from "./loading";

export type BranchListPayload = {
  branchList: string[];
  head: string | null;
};

type BranchStore = {
  branchList: string[];
  selectedBranch: string;
  setBranchList: (branches: string[]) => void;
  setSelectedBranch: (branch: string) => void;
  handleChangeBranchList: (branches: BranchListPayload) => void;
};

export const useBranchStore = create<BranchStore>((set) => ({
  branchList: [],
  selectedBranch: "",
  setBranchList: (branches) => set({ branchList: branches }),
  setSelectedBranch: (branch) => set({ selectedBranch: branch }),
  handleChangeBranchList: (branches) => {
    set((state) => ({
      branchList: branches.branchList,
      selectedBranch: !state.selectedBranch && branches.head ? branches.head : state.selectedBranch,
    }));
    useLoadingStore.getState().setLoading(false);
  },
}));
