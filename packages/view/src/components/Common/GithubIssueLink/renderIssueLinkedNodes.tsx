import { splitMessageByIssueRefs } from "utils/commitMessage";

import GithubIssueLink from "./GithubIssueLink";

export function renderIssueLinkedNodes(message: string, owner: string, repo: string) {
  return splitMessageByIssueRefs(message).map((part) => {
    if (part.type === "issue") {
      const issueNumber = part.value.substring(1);
      return (
        <GithubIssueLink
          key={`issue-${issueNumber}-${part.index}`}
          owner={owner}
          repo={repo}
          issueNumber={issueNumber}
        />
      );
    }
    return part.value;
  });
}
