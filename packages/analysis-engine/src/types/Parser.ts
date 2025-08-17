import type { DifferenceStatistic } from "./CommitRaw";

export interface ParsedRefs {
  branches: string[];
  tags: string[];
}

export interface MessageAndDiffStats {
  message: string;
  diffStats: DifferenceStatistic;
}
