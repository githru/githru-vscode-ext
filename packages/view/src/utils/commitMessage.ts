import type { CommitMessagePart } from "types";

export function splitMessageByIssueRefs(message: string): CommitMessagePart[] {
  const GITHUB_ISSUE_REGEX = /\(\s*(#[0-9]+)\s*\)|\[\s*(#[0-9]+)\s*\]|(?:^|\s)(#[0-9]+)(?=\s|$)/g;
  const parts: CommitMessagePart[] = [];
  let cursor = 0;

  for (;;) {
    const match = GITHUB_ISSUE_REGEX.exec(message);
    if (!match) break;

    const issueRef = match[1] ?? match[2] ?? match[3];
    const issueRefStart = match.index + match[0].indexOf("#");
    const issueRefEnd = issueRefStart + issueRef.length;

    if (issueRefStart > cursor) {
      parts.push({ type: "text", value: message.slice(cursor, issueRefStart) });
    }

    parts.push({
      type: "issue",
      value: issueRef,
      index: issueRefStart,
    });

    cursor = issueRefEnd;
  }

  if (cursor < message.length) {
    parts.push({ type: "text", value: message.slice(cursor) });
  }

  return parts;
}
