import type { ReactNode } from "react";

import type { ClusterNode } from "types";
import type { Commit } from "types/Commit";
import type { AuthSrcMap } from "components/VerticalClusterList/Summary/Summary.type";

export type DetailProps = {
  clusterId: number;
  authSrcMap: AuthSrcMap | null;
};
export type DetailSummaryProps = {
  commitNodeListInCluster: ClusterNode["commitNodeList"];
};

export interface DetailSummaryItem {
  name: string;
  count: number;
  icon?: ReactNode;
}

export interface CommitItemProps {
  commit: Commit;
  owner: string;
  repo: string;
  authSrcMap: AuthSrcMap | null;
  handleCommitIdCopy: (id: string) => () => Promise<void>;
  showMessageBody: boolean;
}

export type VirtualizedItem =
  | {
      type: "summary";
      data: ClusterNode["commitNodeList"];
    }
  | {
      type: "commit";
      data: Commit;
    };
