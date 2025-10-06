import type { IDESentEvents } from "types/IDESentEvents";

export type IDEMessage = {
  command: string;
  uri: string;
};

export default interface IDEPort {
  addIDESentEventListener: (apiCallbacks: IDESentEvents) => void;
  sendRefreshDataMessage: (payload?: string) => void;
  sendFetchAnalyzedDataMessage: (requestParams?: {
    baseBranch?: string;
    perPage?: number;
    lastCommitId?: string;
  }) => void;
  sendFetchBranchListMessage: () => void;
  sendFetchGithubInfo: () => void;
  sendUpdateThemeMessage: (theme: string) => void;
}
