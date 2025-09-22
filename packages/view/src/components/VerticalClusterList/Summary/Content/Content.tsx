import React, { useEffect, useState } from "react";
import ArrowDropDownCircleRoundedIcon from "@mui/icons-material/ArrowDropDownCircleRounded";

import { useGithubInfo } from "store";

import type { ContentProps } from "../Summary.type";

type LinkedMessage = {
  title: React.ReactNode[];
};

const Content = ({ content, clusterId, selectedClusterIds }: ContentProps) => {
  const { owner, repo } = useGithubInfo();
  const [linkedMessage, setLinkedMessage] = useState<LinkedMessage>({
    title: [],
  });

  useEffect(() => {
    const processMessage = (message: string) => {
      // GitHub 이슈 번호 패턴: #123 또는 (#123)
      const regex = /(?:^|\s)(#\d+)(?:\s|$)/g;
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while (true) {
        match = regex.exec(message);
        if (match === null) break;

        // 이슈 번호 앞의 텍스트 추가
        if (match.index > lastIndex) {
          parts.push(message.slice(lastIndex, match.index));
        }

        // 이슈 번호를 링크로 변환
        const issueNumber = match[1].substring(1); // # 제거
        const issueLink = `https://github.com/${owner}/${repo}/issues/${issueNumber}`;

        parts.push(
          <a
            key={`issue-${issueNumber}-${match.index}`}
            href={issueLink}
            target="_blank"
            rel="noopener noreferrer"
            className="summary__commit-issue-link"
            title={`GitHub Issue #${issueNumber}`}
          >
            {match[1]}
          </a>
        );

        lastIndex = match.index + match[0].length;
      }

      // 마지막 부분 추가
      if (lastIndex < message.length) {
        parts.push(message.slice(lastIndex));
      }

      return parts.length > 0 ? parts : [message];
    };

    const messageLines = content.message.split("\n");
    const title = messageLines[0];

    // 제목만 처리
    const processedTitle = processMessage(title);

    setLinkedMessage({
      title: processedTitle,
    });
  }, [content.message, owner, repo]);

  const messageLines = content.message.split("\n");
  const title = messageLines[0];

  return (
    <>
      <div className="summary__content">
        <div className="summary__commit-message">
          <div className="summary__commit-title">
            {linkedMessage.title.length > 0 ? linkedMessage.title : title}
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
