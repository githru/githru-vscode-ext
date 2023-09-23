import React from "react";
import classNames from "classnames/bind";
import { IoIosArrowDropdownCircle, IoIosArrowDropupCircle } from "react-icons/io";

import type { ContentProps } from "../Summary.type";
import styles from "../Summary.module.scss";

const Content = ({ content, clusterId, selectedClusterId }: ContentProps) => {
  const cx = classNames.bind(styles);
  const str: string = content.message;
  const regex = /^(\(#[0-9]+\)|#[0-9]+)/g;
  const tobeStr: string[] = str.split(" ");

  const linkedStr = tobeStr.reduce((acc: React.ReactNode[], tokenStr: string) => {
    const matches = tokenStr.match(regex); // #num 으로 결과가 나옴 ()가 결과에 포함되지 않음
    if (matches) {
      const matchedStr = matches[0];
      const matchedStrNum: string = matchedStr.substring(1);
      const linkIssues = `https://github.com/githru/githru-vscode-ext/issues/${matchedStrNum}`;
      acc.push(
        <a
          href={linkIssues}
          key={`issues-${matchedStr}`}
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

  return (
    <>
      <div className={cx("cluster-summary__contents")}>
        <div className={cx("commit-message__wrapper")}>
          <div className={cx("commit-message")}>{linkedStr}</div>
        </div>
        {content.count > 0 && <span className={cx("more-commit-count")}>+ {content.count} more</span>}
      </div>
      <div className={cx("collapsible-icon")}>
        {selectedClusterId.includes(clusterId) ? (
          <IoIosArrowDropupCircle className={cx("show")} />
        ) : (
          <IoIosArrowDropdownCircle />
        )}
      </div>
    </>
  );
};

export default Content;
