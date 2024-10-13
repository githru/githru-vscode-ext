import { getCommitMessageType } from "./commit.util";
import type { CommitRaw, DifferenceStatistic } from "./types";

export default function getCommitRaws(log: string) {
  if (!log) return [];
  console.log(log);
  const EOL_REGEX = /\r?\n/;
  const COMMIT_SEPARATOR = new RegExp(`${EOL_REGEX.source}{4}`);
  const COMMIT_MESSAGE_BODY_INDENTATION = "    ";

  // step 0: Split log into commits
  const commits = log.substring(2).split(COMMIT_SEPARATOR);
  const commitRaws: CommitRaw[] = [];
  console.log("length: ", commits.length);
  console.log(commits[0]);
  console.log("-----------------");
  console.log(commits[commits.length - 1]);
  for (let commitIdx = 0; commitIdx < commits.length; commitIdx += 1) {
    // step 1: Extract commitData
    const commitData = commits[commitIdx].split(EOL_REGEX);
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
      ...messageAndDiffStats
    ] = commitData;
    // step 2: Extract branch and tag data from refs
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

    // step 3: Extract message and diffStats
    let messageAndDiffStatsIdx = 0;
    let message = "";
    const diffStats: DifferenceStatistic = {
      totalInsertionCount: 0,
      totalDeletionCount: 0,
      fileDictionary: {},
    };
    // Extract message
    while (messageAndDiffStatsIdx < messageAndDiffStats.length && messageAndDiffStats[messageAndDiffStatsIdx] !== "") {
      const line = messageAndDiffStats[messageAndDiffStatsIdx];
      if (line.startsWith(COMMIT_MESSAGE_BODY_INDENTATION)) message += "\n" + line.trim();
      else message += line;
      messageAndDiffStatsIdx++;
    }
    // Extract diffStats
    while (messageAndDiffStatsIdx < messageAndDiffStats.length) {
      const line = messageAndDiffStats[messageAndDiffStatsIdx];
      if (line === "") {
        messageAndDiffStatsIdx++;
        continue;
      }
      const [insertions, deletions, path] = line.split("\t");
      const numberedInsertions = insertions === "-" ? 0 : Number(insertions);
      const numberedDeletions = deletions === "-" ? 0 : Number(deletions);
      diffStats.totalInsertionCount += numberedInsertions;
      diffStats.totalDeletionCount += numberedDeletions;
      diffStats.fileDictionary[path] = {
        insertionCount: numberedInsertions,
        deletionCount: numberedDeletions,
      };
      messageAndDiffStatsIdx++;
    }

    // step 4: Construct commitRaw
    const commitRaw: CommitRaw = {
      sequence: commitIdx,
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
      differenceStatistic: diffStats,
    };
    commitRaws.push(commitRaw);
  }

  return commitRaws;
}
