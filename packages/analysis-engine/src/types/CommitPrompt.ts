import type { CommitMessageType } from "./CommitMessageType";
import type { DifferenceStatistic, GitUser } from "./CommitRaw";

export interface CommitPrompt {
  sequence: number;
  index: string;
  author: GitUser;
  committer: GitUser;
  message: string;
  differenceStatistic: DifferenceStatistic;
  commitMessageType: CommitMessageType;
}
