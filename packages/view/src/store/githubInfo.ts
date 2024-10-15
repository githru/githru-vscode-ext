import { create } from "zustand";

export type githubInfo = {
  owner: string;
  repo: string;
};

export const useGithubInfo = create<
  githubInfo & {
    handleGithubInfo: (repoInfo: githubInfo) => void;
  }
>((set) => ({
  owner: "githru",
  repo: "githru-vscode-ext",
  handleGithubInfo: (repoInfo: githubInfo) => {
    if (repoInfo) {
      set({ owner: repoInfo.owner, repo: repoInfo.repo });
    }
  },
}));
