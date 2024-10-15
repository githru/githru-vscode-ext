import { create } from "zustand";

type RepoStore = {
  repo: string;
  setRepo: (repo: string) => void;
};

export const useRepoStore = create<RepoStore>((set) => ({
  repo: "",
  setRepo: (repo) => set({ repo }),
}));
