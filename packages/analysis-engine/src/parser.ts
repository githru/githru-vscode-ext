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
    // Extract branch and tag data from commitData[2]
    const refs = commitData[2].replace(" -> ", ", ").split(", ");
    const [branches, tags]: string[][] = refs.reduce(
      ([branches, tags], ref) => {
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
      id: commitData[0],
      parents: commitData[1].split(" "),
      branches, // commitData[2] is already split into branches and tags
      tags,
      author: {
        name: commitData[3],
        email: commitData[4],
      },
      authorDate: new Date(commitData[5]),
      committer: {
        name: commitData[6],
        email: commitData[7],
      },
      committerDate: new Date(commitData[8]),
      message: commitData[9],
      commitMessageType: getCommitMessageType(commitData[9]),
      differenceStatistic: {
        totalInsertionCount: 0,
        totalDeletionCount: 0,
        fileDictionary: {},
      },
    };

    // step 2: Extract diffStats from the rest of the commit
    if (!commitData[10]) {
      commitRaws.push(commitRaw);
      continue;
    }
    const diffStats = commitData[10].split(EOL_REGEX);
    for (let diffIdx = 1; diffIdx < diffStats.length; diffIdx += 1) {
      if (diffStats[diffIdx] === "") continue;
      const [insertions, deletions, path] = diffStats[diffIdx].split("\t");
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
