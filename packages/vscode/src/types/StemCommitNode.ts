import type { CommitMessageType } from "./CommitMessageType";
import type { DifferenceStatistic } from "./DifferenceStatistic";

interface GitUser {
  name: string;
  email: string;
}

interface CommitRaw {
  sequence: number;
  id: string;
  parents: string[];
  branches: string[];
  tags: string[];
  author: GitUser;
  authorDate: Date;
  committer: GitUser;
  committerDate: Date;
  message: string;
  differenceStatistic: DifferenceStatistic;
  commitMessageType: CommitMessageType;
}

export interface StemCommitNode {
  // 순회 이전에는 stemId가 존재하지 않음.
  stemId?: string;
  commit: CommitRaw;
}
