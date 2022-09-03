import { CommitRaw } from "./CommitRaw";

export interface CommitNode {
  // 순회 이전에는 stemId가 존재하지 않음.
  stemId?: string;
  traversed: boolean;
  commit: CommitRaw;
}
