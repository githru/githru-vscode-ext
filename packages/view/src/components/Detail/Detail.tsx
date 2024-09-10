import dayjs from "dayjs";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import RemoveCircleRoundedIcon from "@mui/icons-material/RemoveCircleRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import CommitRoundedIcon from "@mui/icons-material/CommitRounded";
import RestorePageRoundedIcon from "@mui/icons-material/RestorePageRounded";

import { Author } from "components/@common/Author";
import { useGlobalData } from "hooks";

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
    { name: "authors", count: authorLength, icon: <PersonRoundedIcon sx={{ fontSize: 18 }} /> },
    { name: "commits", count: commitLength, icon: <CommitRoundedIcon sx={{ fontSize: 18 }} /> },
    { name: "changed files", count: fileLength, icon: <RestorePageRoundedIcon sx={{ fontSize: 18 }} /> },
    { name: "additions", count: insertions, icon: <AddCircleRoundedIcon sx={{ fontSize: 18 }} /> },
    { name: "deletions", count: deletions, icon: <RemoveCircleRoundedIcon sx={{ fontSize: 18 }} /> },
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
  const { repo, owner } = useGlobalData();
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
                  {id.slice(0, 6)}
                  <span className="commit-id__tooltip">{id}</span>
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
          {toggle ? "Hide ..." : "Read More ..."}
        </button>
      )}
    </>
  );
};

export default Detail;
