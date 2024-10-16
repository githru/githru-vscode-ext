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

import { Author } from "components/@common/Author";
import { useGithubInfo } from "store";

import { useCommitListHide } from "./Detail.hook";
import { getCommitListDetail } from "./Detail.util";
import { FIRST_SHOW_NUM } from "./Detail.const";
import type { DetailProps, DetailSummaryProps, DetailSummaryItem } from "./Detail.type";

import "./Detail.scss";

const DetailSummary = ({ commitNodeListInCluster }: DetailSummaryProps) => {
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
};

const Detail = ({ selectedData, clusterId, authSrcMap }: DetailProps) => {
  const commitNodeListInCluster =
    selectedData?.filter((selected) => selected.commitNodeList[0].clusterId === clusterId)[0].commitNodeList ?? [];
  const { commitNodeList, toggle, handleToggle } = useCommitListHide(commitNodeListInCluster);
  const { owner, repo } = useGithubInfo();
  const isShow = commitNodeListInCluster.length > FIRST_SHOW_NUM;
  const handleCommitIdCopy = (id: string) => async () => {
    navigator.clipboard.writeText(id);
  };
  if (!selectedData) return null;

  return (
    <>
      <DetailSummary commitNodeListInCluster={commitNodeListInCluster} />
      <ul className="detail__commit-list">
        {commitNodeList.map(({ commit }) => {
          const { id, message, author, commitDate } = commit;
          return (
            <li
              key={id}
              className="detail__commit-item"
            >
              <div className="commit-item__detail">
                <div className="commit-item__avatar-message">
                  {authSrcMap && (
                    <Author
                      name={author.names.toString()}
                      src={authSrcMap[author.names.toString()]}
                    />
                  )}
                  <div className="commit-item__message-container">
                    <span className="commit-item__message">{message}</span>
                  </div>
                </div>
                <span className="commit-item__author-date">
                  {author.names[0]}, {dayjs(commitDate).format("YY. M. DD. a h:mm")}
                </span>
              </div>
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
                    <p>{`${id.slice(0, 6)}`}</p>
                  </Tooltip>
                </a>
              </div>
            </li>
          );
        })}
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
