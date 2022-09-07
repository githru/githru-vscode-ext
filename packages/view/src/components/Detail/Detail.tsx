import type { GlobalProps } from "types/global";

import { getCommitListDetail, getCommitListInCluster } from "./Detail.util";

const TARGET_CLUSTER_ID = 2433;

const Detail = ({ data }: GlobalProps) => {
  const commitNodeListInCluster = getCommitListInCluster({
    data,
    clusterId: TARGET_CLUSTER_ID,
  });
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
