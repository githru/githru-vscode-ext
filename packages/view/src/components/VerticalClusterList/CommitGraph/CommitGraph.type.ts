import type { CommitRaw } from "types";

export type CommitGraphNode = Pick<CommitRaw, "id" | "parents"> & {
  stemId: string;
};
export type CommitDictionary = {
  [key: string]: CommitGraphNode & { index: number };
};
export type LinkPosition = {
  x: number[];
  y: number[];
};
