import type { Dispatch } from "react";
import type React from "react";

import type { ClusterNode } from "./Nodes";

export type GlobalProps = {
  data: ClusterNode[];
  setData: Dispatch<React.SetStateAction<ClusterNode[]>>;
};
export type SelectedDataProps = ClusterNode[];
