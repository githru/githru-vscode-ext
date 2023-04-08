import type { Dispatch } from "react";
import type React from "react";

import type { ClusterNode } from "types";

export type IDEMessage = {
  command: string;
  uri: string;
};

export default interface IDEPort {
  addAllEventListener: (
    setData: Dispatch<React.SetStateAction<ClusterNode[]>>
  ) => void;
  sendFetchAnalyzedDataCommand: () => void;
}
