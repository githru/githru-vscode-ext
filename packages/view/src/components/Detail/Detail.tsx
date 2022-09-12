import type { CommitNode, SelectedDataProps } from "types";

import "./Detail.scss";
import { useCommitListHide } from "./Detail.hook";
import { getCommitListDetail } from "./Detail.util";
import { FIRST_SHOW_NUM } from "./Detail.const";
import { getTime } from "utils/time";

const DetailSummary = ({
  commitNodeListInCluster,
}: {
  commitNodeListInCluster: CommitNode[];
}) => {
  const { authorLength, fileLength, commitLength, insertions, deletions } =
    getCommitListDetail({ commitNodeListInCluster });
  return (
    <div className="detail-summary_container">
      Excluding merges,
      <span className="detail-summary_impact"> {authorLength} authors </span>
      have pushed
      <span className="detail-summary_impact"> {commitLength} commits </span>
      to main. On main,
      <span className="detail-summary_impact"> {fileLength} files </span>
      have changed and there have been
      <span className="detail-summary_insertions"> {insertions} </span>
      <span className="detail-summary_impact">additions </span>
      and
      <span className="detail-summary_deletions"> {deletions} </span>
      <span className="detail-summary_impact">deletions.</span>
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
