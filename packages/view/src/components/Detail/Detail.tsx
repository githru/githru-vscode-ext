import type { CommitNode, SelectedDataProps } from "types";
import { getTime } from "utils/time";

import { useCommitListHide } from "./Detail.hook";
import { getCommitListDetail } from "./Detail.util";
import { FIRST_SHOW_NUM } from "./Detail.const";

import "./Detail.scss";

const DetailSummary = ({
  commitNodeListInCluster,
}: {
  commitNodeListInCluster: CommitNode[];
}) => {
  const { authorLength, fileLength, commitLength, insertions, deletions } =
    getCommitListDetail({ commitNodeListInCluster });
  return (
    <div className="detail-summary_container">
      <div className="divider" />
      <div className="text">
        <strong>{authorLength}</strong> authors |{" "}
        <strong>{commitLength}</strong> commits | <strong>{fileLength}</strong>{" "}
        changed files | <strong className="insertions">{insertions}</strong>{" "}
        additions and <strong className="deletions">{deletions}</strong>{" "}
        deletions codes
      </div>
    </div>
  );
};

const Detail = ({ selectedData }: { selectedData: SelectedDataProps }) => {
  const commitNodeListInCluster = selectedData?.commitNodeList ?? [];
  const { commitNodeList, toggle, handleToggle } = useCommitListHide(
    commitNodeListInCluster
  );
  const show = commitNodeListInCluster.length > FIRST_SHOW_NUM;
  if (!selectedData) return null;

  return (
    <>
      <DetailSummary commitNodeListInCluster={commitNodeListInCluster} />

      <ul className="detail-commit_item_container">
        {commitNodeList.map(({ commit }) => {
          const { id, message, author, authorDate } = commit;

          return (
            <li key={id} className="detail-commit_item">
              <div>
                - {message},{" "}
                <span>
                  {author.names[0]}, {getTime(authorDate)}
                </span>
              </div>
              <div>
                <span>{id}</span>
              </div>
            </li>
          );
        })}
      </ul>

      {show && (
        <button
          className="detail-summary_toggleButton"
          type="button"
          onClick={handleToggle}
        >
          {toggle ? "Hide ..." : "Read More ..."}
        </button>
      )}
    </>
  );
};

export default Detail;
