import type { DiffStatistics } from "./DiffStatistics";
import type { GitHubUser } from "./GitHubUser";

export type Commit = {
  id: string;
  parentIds: string[];
  author: GitHubUser;
  committer: GitHubUser;
  authorDate: string;
  commitDate: string;
  diffStatistics: DiffStatistics;
  message: string;
  // fill necessary properties...
};
