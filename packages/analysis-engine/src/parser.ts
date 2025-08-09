import { getCommitMessageType } from "./commit.util";
import type { CommitRaw, DifferenceStatistic, MessageAndDiffStats, ParsedRefs } from "./types";

const EOL_REGEX = /\r?\n/;
const COMMIT_SEPARATOR = new RegExp(`${EOL_REGEX.source}{4}`);
const INDENTATION = "    ";

export function splitLogIntoCommits(log: string): string[] {
  return log.substring(2).split(COMMIT_SEPARATOR);
}

export function extractCommitData(commit: string) {
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
  ] = commit.split(EOL_REGEX);

  return {
    id,
    parents,
    refs,
    authorName,
    authorEmail,
    authorDate,
    committerName,
    committerEmail,
    committerDate,
    messageAndDiffStats,
  };
}

export function parseRefsData(refs: string): ParsedRefs {
  if (!refs) return { branches: [], tags: [] };

  const refsArray = refs.replace(" -> ", ", ").split(", ");
  return refsArray.reduce<ParsedRefs>(
    (acc, ref) => {
      if (ref === "") return acc;
      if (ref.startsWith("tag: ")) {
        acc.tags.push(ref.replace("tag: ", ""));
      } else {
        acc.branches.push(ref);
      }
      return acc;
    },
    { branches: [], tags: [] }
  );
}

export function parseDiffStatLine(line: string, diffStats: DifferenceStatistic) {
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

export function parseMessageAndDiffStats(messageAndDiffStats: string[]): MessageAndDiffStats {
  let messageSubject = "";
  let messageBody = "";
  const diffStats: DifferenceStatistic = {
    totalInsertionCount: 0,
    totalDeletionCount: 0,
    fileDictionary: {},
  };

  for (const [idx, line] of messageAndDiffStats.entries()) {
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
      parseDiffStatLine(line, diffStats);
    }
  }

  const message = messageBody === "" ? messageSubject : `${messageSubject}\n${messageBody}`;
  return { message, diffStats };
}

export function createCommitRaw(
  commitIdx: number,
  commitData: ReturnType<typeof extractCommitData>,
  parsedRefs: ParsedRefs,
  parsedMessage: ReturnType<typeof parseMessageAndDiffStats>
): CommitRaw {
  const { id, parents, authorName, authorEmail, authorDate, committerName, committerEmail, committerDate } = commitData;
  const { branches, tags } = parsedRefs;
  const { message, diffStats } = parsedMessage;

  return {
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
}

export default function getCommitRaws(log: string): CommitRaw[] {
  if (!log) return [];

  const commits = splitLogIntoCommits(log);
  return commits.map((commit, idx) => {
    const commitData = extractCommitData(commit);
    const parsedRefs = parseRefsData(commitData.refs);
    const parsedMessage = parseMessageAndDiffStats(commitData.messageAndDiffStats);
    return createCommitRaw(idx, commitData, parsedRefs, parsedMessage);
  });
}
