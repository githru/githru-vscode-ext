import React, { useState, useEffect, useCallback, useMemo } from "react";
import dayjs from "dayjs";
import {
  AddCircleRounded,
  RemoveCircleRounded,
  PersonRounded,
  CommitRounded,
  RestorePageRounded,
  ExpandMoreRounded,
} from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import type { ListRowProps } from "react-virtualized";
import { List, AutoSizer, CellMeasurer } from "react-virtualized";

import { Author } from "components/@common/Author";
import { useGithubInfo, useDataStore } from "store";

import { getCommitListDetail } from "./Detail.util";
import { useVirtualizedList } from "./Detail.hook";
import type { DetailProps, DetailSummaryProps, DetailSummaryItem, CommitItemProps, LinkedMessage } from "./Detail.type";

import "./Detail.scss";

const Detail = ({ clusterId, authSrcMap }: DetailProps) => {
  const selectedData = useDataStore((state) => state.selectedData);
  const [linkedMessage, setLinkedMessage] = useState<LinkedMessage>({
    title: [],
    body: null,
  });

  const { owner, repo } = useGithubInfo();

  const commitNodeListInCluster = useMemo(
    () =>
      selectedData?.filter((selected) => selected.commitNodeList[0].clusterId === clusterId)[0].commitNodeList ?? [],
    [selectedData, clusterId]
  );

  const handleCommitIdCopy = (id: string) => async () => {
    navigator.clipboard.writeText(id);
  };

  const { cache, virtualizedItems, showScrollIndicator, handleRowsRendered } =
    useVirtualizedList(commitNodeListInCluster);

  const renderCommitItem = useCallback(
    (props: { index: number; key: string }) => {
      const { index, key } = props;
      const item = virtualizedItems[index];

      if (item.type === "summary") {
        return <DetailSummary commitNodeListInCluster={item.data} />;
      }
      return (
        <MemoizedCommitItem
          key={key}
          commit={item.data}
          owner={owner}
          repo={repo}
          authSrcMap={authSrcMap}
          handleCommitIdCopy={handleCommitIdCopy}
          linkedMessage={linkedMessage}
        />
      );
    },
    [virtualizedItems]
  );

  const rowRenderer = useCallback(
    ({ index, key, parent, style }: ListRowProps) => (
      <CellMeasurer
        key={key}
        cache={cache}
        parent={parent}
        columnIndex={0}
        rowIndex={index}
      >
        <div style={style}>{renderCommitItem({ index, key })}</div>
      </CellMeasurer>
    ),
    [cache, renderCommitItem]
  );

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
            className="commit-message__issue-link"
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

    if (commitNodeListInCluster?.[0]?.commit?.message) {
      const { message } = commitNodeListInCluster[0].commit;
      const messageLines = message.split("\n");
      const title = messageLines[0];
      const body = messageLines
        .slice(1)
        .filter((line: string) => line.trim())
        .join("\n");

      // 제목과 본문을 각각 처리
      const processedTitle = processMessage(title);
      const processedBody = body ? processMessage(body) : null;

      setLinkedMessage({
        title: processedTitle,
        body: processedBody,
      });
    }
  }, [commitNodeListInCluster, owner, repo]);

  if (!selectedData || selectedData.length === 0) return null;

  return (
    <div className="detail__container">
      <AutoSizer>
        {({ height, width }) => {
          return (
            <List
              height={height}
              width={width}
              rowCount={virtualizedItems.length}
              rowHeight={cache.rowHeight}
              rowRenderer={rowRenderer}
              onRowsRendered={handleRowsRendered}
              className="detail__virtualized-list"
              estimatedRowSize={120}
            />
          );
        }}
      </AutoSizer>

      {showScrollIndicator && (
        <div className="detail__scroll-indicator">
          <ExpandMoreRounded />
        </div>
      )}
    </div>
  );
};

export default Detail;

function CommitItem({ commit, owner, repo, authSrcMap, handleCommitIdCopy, linkedMessage }: CommitItemProps) {
  const { id, message, author, commitDate } = commit;
  return (
    <div className="detail__commit-item">
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
    </div>
  );
}

const MemoizedCommitItem = React.memo(CommitItem);

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
