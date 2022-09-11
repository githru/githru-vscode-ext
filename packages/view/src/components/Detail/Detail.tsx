import type { SelectedDataProps } from "types";

import { getCommitListDetail } from "./Detail.util";

import "./Detail.scss";

const Detail = ({ selectedData }: { selectedData: SelectedDataProps }) => {
  if (!selectedData) return null;
  const commitNodeListInCluster = selectedData.commitNodeList;
  const { authorLength, fileLength, commitLength, insertions, deletions } =
    getCommitListDetail({ commitNodeListInCluster });

  return (
    <>
      <ul className="detail-commit_item_container">
        {commitNodeListInCluster.map((commitNode) => (
          <li key={commitNode.commit.id}>{commitNode.commit.message}</li>
        ))}
      </ul>
      <div className="detail-summary_container">
        Excluding merges,
        <span className="detail-summary_impact"> {authorLength} authors</span>
        have pushed
        <span className="detail-summary_impact"> {commitLength} commits</span>
        to main. On main,
        <span className="detail-summary_impact"> {fileLength} files </span>
        have changed and there have been
        <span className="detail-summary_insersions"> {insertions} </span>
        <span className="detail-summary_impact">additions</span>
        and
        <span className="detail-summary_deletions"> {deletions} </span>
        <span className="detail-summary_impact">deletions.</span>
      </div>
    </>
  );
};

export default Detail;
