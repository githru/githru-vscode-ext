import dayjs from "dayjs";
import classNames from "classnames/bind";

import AuthorIcon from "assets/author.svg";
import ChangedFileIcon from "assets/changed-file.svg";
import CommitIcon from "assets/commit.svg";
import DiffAddIcon from "assets/diff-add.svg";
import DiffDeleteIcon from "assets/diff-delete.svg";
import { Author } from "components/@common/Author";

import { useCommitListHide } from "./Detail.hook";
import { getCommitListDetail } from "./Detail.util";
import { FIRST_SHOW_NUM } from "./Detail.const";
import type { DetailProps, DetailSummaryProps, DetailSummaryItem } from "./Detail.type";
import styles from "./Detail.module.scss";

const DetailSummary = ({ commitNodeListInCluster }: DetailSummaryProps) => {
  const cx = classNames.bind(styles);
  const { authorLength, fileLength, commitLength, insertions, deletions } = getCommitListDetail({
    commitNodeListInCluster,
  });

  const summaryItems: DetailSummaryItem[] = [
    { name: "authors", count: authorLength, icon: <AuthorIcon /> },
    { name: "commits", count: commitLength, icon: <CommitIcon /> },
    { name: "changed files", count: fileLength, icon: <ChangedFileIcon /> },
    { name: "additions", count: insertions, icon: <DiffAddIcon /> },
    { name: "deletions", count: deletions, icon: <DiffDeleteIcon /> },
  ];

  return (
    <div className={cx("detail__summary__container")}>
      <div className={cx("divider")} />
      <div className={cx("detail__summary")}>
        {summaryItems.map(({ name, count, icon }) => (
          <span
            key={name}
            className={cx("detail__summary__item")}
          >
            {icon}
            <strong className={cx({ name })}>{count.toLocaleString("en")} </strong>
            <span className={cx("detail__summary__item__name")}>{count <= 1 ? name.slice(0, -1) : name}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
const Detail = ({ selectedData, clusterId, authSrcMap }: DetailProps) => {
  const cx = classNames.bind(styles);
  const commitNodeListInCluster =
    selectedData?.filter((selected) => selected.commitNodeList[0].clusterId === clusterId)[0].commitNodeList ?? [];
  const { commitNodeList, toggle, handleToggle } = useCommitListHide(commitNodeListInCluster);
  const isShow = commitNodeListInCluster.length > FIRST_SHOW_NUM;
  const handleCommitIdCopy = (id: string) => async () => {
    navigator.clipboard.writeText(id);
  };

  if (!selectedData) return null;

  return (
    <>
      <DetailSummary commitNodeListInCluster={commitNodeListInCluster} />
      <ul className={cx("detail__commit-list__container")}>
        {commitNodeList.map(({ commit }) => {
          const { id, message, author, commitDate } = commit;
          return (
            <li
              key={id}
              className={cx("commit-item")}
            >
              <div className={cx("commit-detail")}>
                <div className={cx("avatar-message")}>
                  {authSrcMap && (
                    <Author
                      name={author.names.toString()}
                      src={authSrcMap[author.names.toString()]}
                    />
                  )}
                  <div className={cx("message-container")}>
                    <span className={cx("message")}>{message}</span>
                  </div>
                </div>
                <span className={cx("author-date")}>
                  {author.names[0]}, {dayjs(commitDate).format("YY. M. DD. a h:mm")}
                </span>
              </div>
              <div className={cx("commit-id")}>
                <span
                  onClick={handleCommitIdCopy(id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={handleCommitIdCopy(id)}
                >
                  {id.slice(0, 6)}
                  <span className={cx("commit-id__tooltip")}>{id}</span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      {isShow && (
        <button
          type="button"
          className={cx("toggle-button")}
          onClick={handleToggle}
        >
          {toggle ? "Hide ..." : "Read More ..."}
        </button>
      )}
    </>
  );
};

export default Detail;
