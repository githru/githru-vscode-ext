import type { IDESentEvents } from "types/IDESentEvents";

export type IDEMessage = {
  command: string;
  uri: string;
};

export default interface IDEPort {
  addIDESentEventListener: (apiCallbacks: IDESentEvents) => void;
  sendFetchMoreGitLogMessage: (skipLogCount?: number) => void;
  sendRefreshDataMessage: (payload?: string) => void;
  sendFetchAnalyzedDataMessage: (payload?: string) => void;
  sendFetchBranchListMessage: () => void;
  setPrimaryColor: (color: string) => void;
}
