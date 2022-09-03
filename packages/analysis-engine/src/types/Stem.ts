import { CommitNode } from "./CommitNode";

export interface Stem {
  id: string;
  headId: string;
  tailId: string;
  nodes: CommitNode[];
}
