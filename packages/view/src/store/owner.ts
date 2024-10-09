import { create } from "zustand";

type OwnerStore = {
  owner: string;
  setOwner: (owner: string) => void;
};

export const useOwnerStore = create<OwnerStore>((set) => ({
  owner: "",
  setOwner: (owner) => set({ owner }),
}));
