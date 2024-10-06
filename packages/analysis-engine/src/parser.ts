import { getCommitMessageType } from "./commit.util";
import { COMMIT_SEPARATOR, GIT_LOG_SEPARATOR } from "./constant";
import type { CommitRaw } from "./types";

export default function getCommitRaws(log: string) {
  if (!log) return [];
  const EOL_REGEX = /\r?\n/;

  // step 0: Split log into commits
  const commits = log.split(COMMIT_SEPARATOR);
  const commitRaws: CommitRaw[] = [];
  // skip the first empty element
  for (let commitIdx = 1; commitIdx < commits.length; commitIdx += 1) {
    // step 1: Extract commitData from the first line of the commit
    const commitData = commits[commitIdx].split(GIT_LOG_SEPARATOR);
    const [
      id,
      parents,
      refs,
      authorName,
      authorEmail,
      authorDate,
      committerName,
      committerEmail,
      committerDate,
      message,
      diffStats,
    ] = commitData;
    // Extract branch and tag data from refs
    const refsArray = refs.replace(" -> ", ", ").split(", ");
    const [branches, tags]: string[][] = refsArray.reduce(
      ([branches, tags], ref) => {
        if (ref === "") return [branches, tags];
        if (ref.startsWith("tag: ")) {
          tags.push(ref.replace("tag: ", ""));
        } else {
          branches.push(ref);
        }
        return [branches, tags];
      },
      [new Array<string>(), new Array<string>()]
    );

    // make base commitRaw object
    const commitRaw: CommitRaw = {
      sequence: commitIdx - 1,
      id,
      parents: parents.split(" "),
      branches,
      tags,
      author: {
        name: authorName,
        email: authorEmail,
      },
      authorDate: new Date(authorDate),
      committer: {
        name: committerName,
        email: committerEmail,
      },
      committerDate: new Date(committerDate),
      message,
      commitMessageType: getCommitMessageType(message),
      differenceStatistic: {
        totalInsertionCount: 0,
        totalDeletionCount: 0,
        fileDictionary: {},
      },
    };

    // step 2: Extract diffStats from the rest of the commit
    if (!diffStats) {
      commitRaws.push(commitRaw);
      continue;
    }
    const diffStatsArray = diffStats.split(EOL_REGEX);
    // pass the first empty element
    for (let diffIdx = 1; diffIdx < diffStatsArray.length; diffIdx += 1) {
      if (diffStatsArray[diffIdx] === "") continue;
      const [insertions, deletions, path] = diffStatsArray[diffIdx].split("\t");
      const numberedInsertions = insertions === "-" ? 0 : Number(insertions);
      const numberedDeletions = deletions === "-" ? 0 : Number(deletions);
      commitRaw.differenceStatistic.totalInsertionCount += numberedInsertions;
      commitRaw.differenceStatistic.totalDeletionCount += numberedDeletions;
      commitRaw.differenceStatistic.fileDictionary[path] = {
        insertionCount: numberedInsertions,
        deletionCount: numberedDeletions,
      };
    }
    commitRaws.push(commitRaw);
  }

  return commitRaws;
}
