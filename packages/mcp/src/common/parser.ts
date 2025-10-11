import { getCommitMessageType } from '../engine/commit.js';
import type { CommitRaw, DifferenceStatistic } from "./types.js";

interface ParsedRefs {
  branches: string[];
  tags: string[];
}

interface MessageAndDiffStats {
  message: string;
  diffStats: DifferenceStatistic;
}

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

export function extractBranchesAndTags(refs: string): ParsedRefs {
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

export function processDiffStatLine(line: string, diffStats: DifferenceStatistic) {
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

export function extractMessageAndDiffStats(messageAndDiffStats: string[]): MessageAndDiffStats {
  let messageSubject = "";
  let messageBody = "";
  const diffStats: DifferenceStatistic = {
    totalInsertionCount: 0,
    totalDeletionCount: 0,
    fileDictionary: {},
  };

  for (const [idx, line] of messageAndDiffStats.entries()) {
    if (idx === 0) {
      messageSubject = line;
      continue;
    }

    if (line.startsWith(INDENTATION)) {
      messageBody += idx === 1 ? line.trim() : `\n${line.trim()}`;
      continue;
    }

    if (line === "") continue;

    processDiffStatLine(line, diffStats);
  }

  const message = messageBody === "" ? messageSubject : `${messageSubject}\n${messageBody}`;
  return { message, diffStats };
}

export function createCommitRaw(
  commitIdx: number,
  commitData: ReturnType<typeof extractCommitData>,
  parsedRefs: ParsedRefs,
  parsedMessage: ReturnType<typeof extractMessageAndDiffStats>
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
    const parsedRefs = extractBranchesAndTags(commitData.refs);
    const parsedMessage = extractMessageAndDiffStats(commitData.messageAndDiffStats);
    return createCommitRaw(idx, commitData, parsedRefs, parsedMessage);
  });
}
