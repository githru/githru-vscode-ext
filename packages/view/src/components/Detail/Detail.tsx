import type { SelectedDataProps } from "types/global";

import { getCommitListDetail } from "./Detail.util";

const Detail = ({ selectedData }: { selectedData: SelectedDataProps }) => {
  if (!selectedData) return null;
  const commitNodeListInCluster = selectedData.commitNodeList;
  const { authorLength, fileLength, commitLength, insertions, deletions } =
    getCommitListDetail({ commitNodeListInCluster });

  return (
    <>
      {commitNodeListInCluster.map((commitNode) => (
        <div key={commitNode.commit.id}>{commitNode.commit.message}</div>
      ))}
      <div>
        Excluding merges, {authorLength} authors have pushed {commitLength}
        commits to main. On main, {fileLength} files have changed and there have
        been
        {insertions} additions and {deletions} deletions.
      </div>
    </>
  );
};

export default Detail;
