import type { CommitNode, SelectedDataProps } from "types";
import { getTime } from "utils";

import { useCommitListHide } from "./Detail.hook";
import { getCommitListDetail } from "./Detail.util";
import { FIRST_SHOW_NUM } from "./Detail.const";

import "./Detail.scss";

type DetailSummaryProps = {
  commitNodeListInCluster: CommitNode[];
};
type DetailProps = { selectedData: SelectedDataProps };

const DetailSummary = ({ commitNodeListInCluster }: DetailSummaryProps) => {
  const { authorLength, fileLength, commitLength, insertions, deletions } =
    getCommitListDetail({ commitNodeListInCluster });

  return (
    <div className="detail__summary__container">
      <div className="divider" />
      <div className="detail__summary">
        <strong>{authorLength}</strong> authors |{" "}
        <strong>{commitLength}</strong> commits | <strong>{fileLength}</strong>{" "}
        changed files | <strong className="insertions">{insertions}</strong>{" "}
        additions and <strong className="deletions">{deletions}</strong>{" "}
        deletions codes
      </div>
    </div>
  );
};

const Detail = ({ selectedData }: DetailProps) => {
  const commitNodeListInCluster = selectedData?.commitNodeList ?? [];
  const { commitNodeList, toggle, handleToggle } = useCommitListHide(
    commitNodeListInCluster
  );
  const isShow = commitNodeListInCluster.length > FIRST_SHOW_NUM;

  if (!selectedData) return null;

  return (
    <>
      <DetailSummary commitNodeListInCluster={commitNodeListInCluster} />
      <ul className="detail__commit-list__container">
        {commitNodeList.map(({ commit }) => {
          const { id, message, author, authorDate } = commit;
          return (
            <li key={id} className="commit-item">
              <div className="commit-detail">
                <span className="message">{message}, </span>
                <span>
                  {author.names[0]}, {getTime(authorDate)}
                </span>
              </div>
              <div className="commit-id">
                <span>{id.slice(0, 6)}</span>
              </div>
            </li>
          );
        })}
      </ul>
      {isShow && (
        <button type="button" className="toggle-button" onClick={handleToggle}>
          {toggle ? "Hide ..." : "Read More ..."}
        </button>
      )}
    </>
  );
};

export default Detail;
