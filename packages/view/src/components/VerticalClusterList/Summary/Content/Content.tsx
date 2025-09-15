import React, { useEffect, useState } from "react";
import ArrowDropDownCircleRoundedIcon from "@mui/icons-material/ArrowDropDownCircleRounded";

import { useGithubInfo } from "store";

import type { ContentProps } from "../Summary.type";

const Content = ({ content, clusterId, selectedClusterIds }: ContentProps) => {
  const { owner, repo } = useGithubInfo();
  const [linkedStr, setLinkedStr] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const str: string = content.message;
    const regex = /^(\(#[0-9]+\)|#[0-9]+)/g;
    const tobeStr: string[] = str.split(" ");

    const newLinkedStr = tobeStr.reduce((acc: React.ReactNode[], tokenStr: string) => {
      const matches = tokenStr.match(regex); // #num 으로 결과가 나옴 ()가 결과에 포함되지 않음
      if (matches) {
        const matchedStr = matches[0];
        const matchedStrNum: string = matchedStr.substring(1);
        const linkIssues = `https://github.com/${owner}/${repo}/issues/${matchedStrNum}`;
        acc.push(
          <a
            href={linkIssues}
            key={`issues-${matchedStr}`}
            className="summary__commit-link"
          >
            {matchedStr}
          </a>
        );
        acc.push(" ");
      } else {
        acc.push(tokenStr);
        acc.push(" ");
      }
      return acc;
    }, []);
    setLinkedStr(newLinkedStr);
  }, [content]);

  return (
    <>
      <div className="summary__content">
        <div className="summary__commit-message">{linkedStr}</div>
        {content.count > 0 && <span className="summary__more-commit">+ {content.count} more</span>}
      </div>
      <div className={`summary__toggle${selectedClusterIds.includes(clusterId) ? "--visible" : ""}`}>
        <ArrowDropDownCircleRoundedIcon />
      </div>
    </>
  );
};

export default Content;
