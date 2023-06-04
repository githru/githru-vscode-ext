import type { ClusterNode } from "types";

export type IDEMessage = {
  command: string;
  uri: string;
};

export default interface IDEPort {
  addAllEventListener: (
    fetchAnalyzedData: (analyzedData: ClusterNode[]) => void
  ) => void;
  sendFetchAnalyzedDataCommand: () => void;
  setPrimaryColor: (color: string) => void;
}
