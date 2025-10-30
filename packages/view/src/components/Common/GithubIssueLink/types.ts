import type { ReactNode } from "react";

export type IssueLinkedMessage = {
  title: ReactNode[];
  body?: ReactNode[] | null;
};
