import type { IDESentEvents } from "types/IDESentEvents";

export type IDEMessage = {
  command: string;
  uri: string;
};

export default interface IDEPort {
  addIDESentEventListener: (apiCallbacks: IDESentEvents) => void;
  sendFetchAnalyzedDataMessage: (payload?: string) => void;
  sendGetBranchListMessage: () => void;
  setPrimaryColor: (color: string) => void;
}
