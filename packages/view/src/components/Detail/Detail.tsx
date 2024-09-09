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
    { name: "authors", count: authorLength, icon: <PersonRounded sx={{ fontSize: 18 }} /> },
    { name: "commits", count: commitLength, icon: <CommitRounded sx={{ fontSize: 18 }} /> },
    { name: "changed files", count: fileLength, icon: <RestorePageRounded sx={{ fontSize: 18 }} /> },
    { name: "additions", count: insertions, icon: <AddCircleRounded sx={{ fontSize: 18 }} /> },
    { name: "deletions", count: deletions, icon: <RemoveCircleRounded sx={{ fontSize: 18 }} /> },
  ];

  return (
    <div className="detail__summary__container">
      <div className="divider" />
      <div className="detail__summary">
        {summaryItems.map(({ name, count, icon }) => (
          <span
            key={name}
            className="detail__summary__item"
          >
            {icon}
            <strong className={name}>{count.toLocaleString("en")} </strong>
            <span className="detail__summary__item__name">{count <= 1 ? name.slice(0, -1) : name}</span>
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
      <ul className="detail__commit-list__container">
        {commitNodeList.map(({ commit }) => {
          const { id, message, author, commitDate } = commit;
          return (
            <li
              key={id}
              className="commit-item"
            >
              <div className="commit-detail">
                <div className="avatar-message">
                  {authSrcMap && (
                    <Author
                      name={author.names.toString()}
                      src={authSrcMap[author.names.toString()]}
                    />
                  )}
                  <div className="message-container">
                    <span className="message">{message}</span>
                  </div>
                </div>
                <span className="author-date">
                  {author.names[0]}, {dayjs(commitDate).format("YY. M. DD. a h:mm")}
                </span>
              </div>
              <div className="commit-id">
                <a
                  href={`https://github.com/${owner}/${repo}/commit/${id}`}
                  onClick={handleCommitIdCopy(id)}
                  tabIndex={0}
                  onKeyDown={handleCommitIdCopy(id)}
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
          className="toggle-button"
          onClick={handleToggle}
        >
          {toggle ? <ExpandLessRounded /> : <ExpandMoreRounded />}
        </button>
      )}
    </>
  );
};

export default Detail;
