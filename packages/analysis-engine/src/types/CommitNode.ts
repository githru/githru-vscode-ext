import { CommitRaw } from "./CommitRaw";

export interface CommitNode {
  // 순회 이전에는 stemId가 존재하지 않음.
  stemId?: string;
  commit: CommitRaw;
}

export type CommitDict = Map<string, CommitNode>;
