import dayjs from "dayjs";

import { useCommitListHide } from "./Detail.hook";
import { getCommitListDetail } from "./Detail.util";
import { FIRST_SHOW_NUM } from "./Detail.const";
import type { DetailProps, DetailSummaryProps } from "./Detail.type";

import "./Detail.scss";

const DetailSummary = ({ commitNodeListInCluster }: DetailSummaryProps) => {
  const { authorLength, fileLength, commitLength, insertions, deletions } = getCommitListDetail({
    commitNodeListInCluster,
  });

  const summaryItems = [
    { name: "authors", count: authorLength },
    { name: "commits", count: commitLength },
    { name: "changed files", count: fileLength },
    { name: "additions", count: insertions },
    { name: "deletions", count: deletions },
  ];

  return (
    <div className="detail__summary__container">
      <div className="divider" />
      <div className="detail__summary">
        {summaryItems.map(({ name, count }) => (
          <span key={name}>
            <strong className={name}>{count.toLocaleString("en")} </strong>
            {count <= 1 ? name.slice(0, -1) : name}
          </span>
        ))}
      </div>
    </div>
  );
};
const Detail = ({ selectedData, clusterId }: DetailProps) => {
  const commitNodeListInCluster =
    selectedData?.filter((selected) => selected?.commitNodeList[0].clusterId === clusterId)[0].commitNodeList ?? [];
  const { commitNodeList, toggle, handleToggle } = useCommitListHide(commitNodeListInCluster);
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
                <span className="message">{message} </span>
                <span className="author-date">
                  {author.names[0]}, {dayjs(commitDate).format("YY. M. DD. a h:mm")}
                </span>
              </div>
              <div className="commit-id">
                <span
                  onClick={handleCommitIdCopy(id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={handleCommitIdCopy(id)}
                >
                  {id.slice(0, 6)}
                  <span className="commit-id__tooltip">{id}</span>
                </span>
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
          {toggle ? "Hide ..." : "Read More ..."}
        </button>
      )}
    </>
  );
};

export default Detail;
