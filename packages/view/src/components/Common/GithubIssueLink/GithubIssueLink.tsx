import cn from "classnames";

import type { GithubIssueLinkProps } from "./GithubIssueLink.type";
import "./GithubIssueLink.scss";

const GithubIssueLink = ({ owner, repo, issueNumber, className, ...rest }: GithubIssueLinkProps) => {
  const issueLink = `https://github.com/${owner}/${repo}/issues/${issueNumber}`;

  return (
    <a
      href={issueLink}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("github-issue-link", className)}
      title={`GitHub Issue #${issueNumber}`}
      {...rest}
    >
      #{issueNumber}
    </a>
  );
};

export default GithubIssueLink;
