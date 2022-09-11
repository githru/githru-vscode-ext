import type { CommitNode, SelectedDataProps } from "types";

import { getCommitListDetail } from "./Detail.util";

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
  if (!selectedData) return null;
  const commitNodeListInCluster = selectedData.commitNodeList;

  return (
    <>
      <DetailSummary commitNodeListInCluster={commitNodeListInCluster} />
      <ul className="detail-commit_item_container">
        {commitNodeListInCluster.map((commitNode) => (
          <li key={commitNode.commit.id}>{commitNode.commit.message}</li>
        ))}
      </ul>
    </>
  );
};

export default Detail;
