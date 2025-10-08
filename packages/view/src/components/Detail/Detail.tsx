import { useMemo } from "react";
import dayjs from "dayjs";
import {
  AddCircleRounded,
  RemoveCircleRounded,
  PersonRounded,
  CommitRounded,
  RestorePageRounded,
  ExpandMoreRounded,
  ExpandLessRounded,
} from "@mui/icons-material";
import { Tooltip } from "@mui/material";

import { useGithubInfo, useDataStore } from "store";
import { Author } from "components/Common/Author";
import type { IssueLinkedMessage } from "components/Common/GithubIssueLink";
import { renderIssueLinkedNodes } from "components/Common/GithubIssueLink";

import { useCommitListHide } from "./Detail.hook";
import { getCommitListDetail } from "./Detail.util";
import { FIRST_SHOW_NUM } from "./Detail.const";
import type { DetailProps, DetailSummaryProps, DetailSummaryItem, CommitItemProps } from "./Detail.type";

import "./Detail.scss";

const Detail = ({ clusterId, authSrcMap }: DetailProps) => {
  const selectedData = useDataStore((state) => state.selectedData);
  const { owner, repo } = useGithubInfo();

  const commitNodeListInCluster = useMemo(
    () =>
      selectedData?.filter((selected) => selected.commitNodeList[0].clusterId === clusterId)[0].commitNodeList ?? [],
    [selectedData, clusterId]
  );
  const { commitNodeList, toggle, handleToggle } = useCommitListHide(commitNodeListInCluster);

  const isShow = commitNodeListInCluster.length > FIRST_SHOW_NUM;

  const handleCommitIdCopy = (id: string) => async () => {
    navigator.clipboard.writeText(id);
  };

  const issueLinkedMessage: IssueLinkedMessage = useMemo(() => {
    const message = commitNodeListInCluster?.[0]?.commit?.message;
    if (!message) return { title: [], body: null };

    const [title, ...rest] = message.split("\n");
    const body = rest.filter((line) => line.trim()).join("\n");

    return {
      title: renderIssueLinkedNodes(title, owner, repo),
      body: body ? renderIssueLinkedNodes(body, owner, repo) : null,
    };
  }, [commitNodeListInCluster, owner, repo]);

  if (!selectedData || selectedData.length === 0) return null;

  return (
    <>
      <DetailSummary commitNodeListInCluster={commitNodeListInCluster} />
      <ul className="detail__commit-list">
        {commitNodeList.map(({ commit }) => (
          <CommitItem
            key={commit.id}
            commit={commit}
            owner={owner}
            repo={repo}
            authSrcMap={authSrcMap}
            handleCommitIdCopy={handleCommitIdCopy}
            linkedMessage={issueLinkedMessage}
          />
        ))}
      </ul>

      {isShow && (
        <button
          type="button"
          className="detail__toggle-button"
          onClick={handleToggle}
        >
          {toggle ? <ExpandLessRounded /> : <ExpandMoreRounded />}
        </button>
      )}
    </>
  );
};

export default Detail;

function CommitItem({ commit, owner, repo, authSrcMap, handleCommitIdCopy, linkedMessage }: CommitItemProps) {
  const { id, message, author, commitDate } = commit;
  return (
    <li
      key={id}
      className="detail__commit-item"
    >
      <div className="commit-item__detail">
        <div className="commit-item__message-container">
          <div className="commit-message">
            <div className="commit-message__header">
              {authSrcMap && (
                <Author
                  name={author.names.toString()}
                  src={authSrcMap[author.names.toString()]}
                />
              )}
              <div className="commit-message__title">
                {(() => {
                  const messageLines = message.split("\n");
                  const title = messageLines[0];
                  return linkedMessage.title.length > 0 ? linkedMessage.title : title;
                })()}
              </div>
              <div className="commit-item__meta">
                <span className="commit-item__author-name">{author.names[0]}</span>
                <span className="commit-item__date">{dayjs(commitDate).format("YY. M. DD. a h:mm")}</span>
                <div className="commit-item__commit-id">
                  <a
                    href={`https://github.com/${owner}/${repo}/commit/${id}`}
                    onClick={handleCommitIdCopy(id)}
                    tabIndex={0}
                    onKeyDown={handleCommitIdCopy(id)}
                    className="commit-id__link"
                  >
                    <Tooltip
                      className="commit-id__tooltip"
                      placement="right"
                      title={id}
                      PopperProps={{ sx: { ".MuiTooltip-tooltip": { bgcolor: "#3c4048" } } }}
                    >
                      <p>{id.slice(0, 6)}</p>
                    </Tooltip>
                  </a>
                </div>
              </div>
            </div>
            {(() => {
              const messageLines = message.split("\n");
              const body = messageLines
                .slice(1)
                .filter((line: string) => line.trim())
                .join("\n");

              return body ? (
                <div className="commit-message__body">{linkedMessage.body ? linkedMessage.body : body}</div>
              ) : null;
            })()}
          </div>
        </div>
      </div>
    </li>
  );
}

function DetailSummary({ commitNodeListInCluster }: DetailSummaryProps) {
  const { authorLength, fileLength, commitLength, insertions, deletions } = getCommitListDetail({
    commitNodeListInCluster,
  });

  const summaryItems: DetailSummaryItem[] = [
    { name: "authors", count: authorLength, icon: <PersonRounded sx={{ fontSize: 18 }} /> },
    { name: "commits", count: commitLength, icon: <CommitRounded sx={{ fontSize: 18 }} /> },
    { name: "changed files", count: fileLength, icon: <RestorePageRounded sx={{ fontSize: 18 }} /> },
    { name: "additions", count: insertions, icon: <AddCircleRounded sx={{ fontSize: 18 }} /> },
    { name: "deletions", count: deletions, icon: <RemoveCircleRounded sx={{ fontSize: 18 }} /> },
  ];

  return (
    <div className="detail__summary">
      <div className="detail__summary-divider" />
      <div className="detail__summary-list">
        {summaryItems.map(({ name, count, icon }) => (
          <span
            key={name}
            className="detail__summary-item"
          >
            {icon}
            <strong className={name}>{count.toLocaleString("en")} </strong>
            <span className="detail__summary-item-name">{count <= 1 ? name.slice(0, -1) : name}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
