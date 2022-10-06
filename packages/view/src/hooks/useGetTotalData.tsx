import { useState, useEffect } from "react";

import type { CommitGraphNode } from "components/VerticalClusterList/CommitGraph/CommitGraph.type";
import type { ClusterNode } from "types";

import fakeData from "../fake-assets/cluster-nodes.json";
import fakeData2 from "../fake-assets/commit-graph-nodes.json";

export const useGetTotalData = () => {
  const [data, setData] = useState<ClusterNode[]>([]);
  const [commitGraphNodes, setCommitGraphNodes] = useState<CommitGraphNode[]>(
    []
  );

  useEffect(() => {
    console.log("isProduction = ", window.isProduction);

    if (window.isProduction) {
      setData(window.githruData as ClusterNode[]);
      setCommitGraphNodes(window.commitGraphNodes as CommitGraphNode[]);
    } else {
      setData(fakeData as unknown as ClusterNode[]);
      setCommitGraphNodes(fakeData2 as CommitGraphNode[]);
    }
  }, []);

  return { data, commitGraphNodes };
};
