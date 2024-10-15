import { getCommitMessageType } from "./commit.util";
import type { CommitRaw, DifferenceStatistic } from "./types";

export default function getCommitRaws(log: string) {
  if (!log) return [];
  const EOL_REGEX = /\r?\n/;
  const COMMIT_SEPARATOR = new RegExp(`${EOL_REGEX.source}{4}`);
  const INDENTATION = "    ";

  // step 0: Split log into commits
  const commits = log.substring(2).split(COMMIT_SEPARATOR);
  const commitRaws: CommitRaw[] = [];
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
    let messageSubject = "";
    let messageBody = "";
    const diffStats: DifferenceStatistic = {
      totalInsertionCount: 0,
      totalDeletionCount: 0,
      fileDictionary: {},
    };
    for (let idx = 0; idx < messageAndDiffStats.length; idx++) {
      const line = messageAndDiffStats[idx];
      if (idx === 0)
        // message subject
        messageSubject = line;
      else if (line.startsWith(INDENTATION)) {
        // message body (add newline if not first line)
        messageBody += idx === 1 ? line.trim() : `\n${line.trim()}`;
      } else if (line === "")
        // pass empty line
        continue;
      else {
        // diffStats
        const [insertions, deletions, path] = line.split("\t");
        const numberedInsertions = insertions === "-" ? 0 : Number(insertions);
        const numberedDeletions = deletions === "-" ? 0 : Number(deletions);
        diffStats.totalInsertionCount += numberedInsertions;
        diffStats.totalDeletionCount += numberedDeletions;
        diffStats.fileDictionary[path] = {
          insertionCount: numberedInsertions,
          deletionCount: numberedDeletions,
        };
      }
    }

    const message = messageBody === "" ? messageSubject : `${messageSubject}\n${messageBody}`;
    // step 4: Construct commitRaw
    const commitRaw: CommitRaw = {
      sequence: commitIdx,
      id,
      parents: parents.length === 0 ? [] : parents.split(" "),
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
