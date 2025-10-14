import { useMemo } from "react";
import ArrowDropDownCircleRoundedIcon from "@mui/icons-material/ArrowDropDownCircleRounded";

import { useGithubInfo } from "store";
import type { IssueLinkedMessage } from "components/Common/GithubIssueLink";
import { renderIssueLinkedNodes } from "components/Common/GithubIssueLink";

import type { ContentProps } from "../Summary.type";

const Content = ({ content, clusterId, selectedClusterIds }: ContentProps) => {
  const { owner, repo } = useGithubInfo();

  const issueLinkedMessage: IssueLinkedMessage = useMemo(() => {
    return { title: renderIssueLinkedNodes(content.message.split("\n")[0], owner, repo) };
  }, [content.message, owner, repo]);

  const messageLines = content.message.split("\n");
  const title = messageLines[0];

  return (
    <>
      <div className="summary__content">
        <div className="summary__commit-message">
          <div className="summary__commit-title">
            {issueLinkedMessage.title.length > 0 ? issueLinkedMessage.title : title}
          </div>
        </div>
        {content.count > 0 && <span className="summary__more-commit">+ {content.count} more</span>}
      </div>
      <div className={`summary__toggle${selectedClusterIds.includes(clusterId) ? "--visible" : ""}`}>
        <ArrowDropDownCircleRoundedIcon />
      </div>
    </>
  );
};

export default Content;
