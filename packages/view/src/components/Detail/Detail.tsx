import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
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

import { useGithubInfo, useDataStore } from "store";
import { Author } from "components/Common/Author";
import { renderIssueLinkedNodes } from "components/Common/GithubIssueLink";

import { getCommitListDetail } from "./Detail.util";
import { useVirtualizedList } from "./Detail.hook";
import type { DetailProps, DetailSummaryProps, DetailSummaryItem, CommitItemProps } from "./Detail.type";

import "./Detail.scss";

const Detail = ({ clusterId, authSrcMap }: DetailProps) => {
  const selectedData = useDataStore((state) => state.selectedData);
  const { owner, repo } = useGithubInfo();

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const prevIndexRef = useRef<number | null>(null);
  const listRef = useRef<List>(null);

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

  useLayoutEffect(() => {
    const [currentIndex, prevIndex] = [hoverIndex, prevIndexRef.current];
    const refreshRowHeight = (index: number) => {
      cache.clear(index, 0);
      listRef.current?.recomputeRowHeights(index);
    };

    requestAnimationFrame(() => {
      if (prevIndex != null) refreshRowHeight(prevIndex);
      if (currentIndex != null) {
        refreshRowHeight(currentIndex);
        requestAnimationFrame(() => {
          listRef.current?.scrollToRow?.(currentIndex);
        });
      }
      prevIndexRef.current = currentIndex;
    });
  }, [hoverIndex, cache]);

  const renderCommitItem = useCallback(
    (props: { index: number; key: string; expanded: boolean }) => {
      const { index, key, expanded } = props;
      const item = virtualizedItems[index];
      const showMessageBody = !(index === 1 && commitNodeListInCluster.length > 1);

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
          showMessageBody={showMessageBody}
          expanded={expanded}
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
        <div
          style={style}
          onMouseEnter={() => setHoverIndex(index)}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {renderCommitItem({ index, key, expanded: hoverIndex === index })}
        </div>
      </CellMeasurer>
    ),
    [cache, renderCommitItem, hoverIndex]
  );

  if (!selectedData || selectedData.length === 0) return null;

  return (
    <div className="detail__container">
      <AutoSizer>
        {({ height, width }) => {
          return (
            <List
              ref={listRef}
              height={height}
              width={width}
              rowCount={virtualizedItems.length}
              rowHeight={cache.rowHeight}
              rowRenderer={rowRenderer}
              onRowsRendered={handleRowsRendered}
              className="detail__virtualized-list"
              estimatedRowSize={120}
              deferredMeasurementCache={cache}
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

function CommitItem({
  commit,
  owner,
  repo,
  authSrcMap,
  handleCommitIdCopy,
  showMessageBody,
  expanded,
}: CommitItemProps) {
  const { id, message, author, commitDate } = commit;

  const { issueLinkedTitle, body } = useMemo(() => {
    const [title, ...bodyLines] = message.split("\n");
    return {
      issueLinkedTitle: renderIssueLinkedNodes(title, owner, repo),
      body: bodyLines.filter(Boolean).join("\n"),
    };
  }, [message, owner, repo]);

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
              <div className="commit-message__title">{issueLinkedTitle}</div>
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
                      placement="right"
                      title={id}
                    >
                      <p>{id.slice(0, 6)}</p>
                    </Tooltip>
                  </a>
                </div>
              </div>
            </div>
            {showMessageBody && body && (
              <div className={`commit-message__body${expanded ? "--visible" : ""}`}>{expanded ? body : null}</div>
            )}
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
