type TextPart = { type: "text"; value: string };
type IssueRefPart = { type: "issue"; value: string; index: number };

export type CommitMessagePart = TextPart | IssueRefPart;
