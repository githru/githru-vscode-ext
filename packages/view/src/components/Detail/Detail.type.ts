import type { ReactNode } from "react";

import type { ClusterNode } from "types";
import type { Commit } from "types/Commit";
import type { AuthSrcMap } from "components/VerticalClusterList/Summary/Summary.type";

export type LinkedMessage = {
  title: ReactNode[];
  body: ReactNode[] | null;
};

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
  linkedMessage: LinkedMessage;
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
