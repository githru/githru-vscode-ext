import type { IDESentEvents } from "types/IDESentEvents";

export type IDEMessage = {
  command: string;
  uri: string;
};

export default interface IDEPort {
  addIDESentEventListener: (apiCallbacks: IDESentEvents) => void;
  sendRefreshDataMessage: (payload?: string) => void;
  sendFetchAnalyzedDataMessage: (payload?: string) => void;
  sendGetBranchListMessage: () => void;
  setPrimaryColor: (color: string) => void;
}
