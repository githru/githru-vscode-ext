import type { IDESentEvents } from "types/IDESentEvents";
import type { FetchDataRequestPayload, RefreshDataRequestPayload } from "types/IDEMessage";

export type IDEMessage = {
  command: string;
  uri: string;
};

export default interface IDEPort {
  addIDESentEventListener: (apiCallbacks: IDESentEvents) => void;
  sendRefreshDataMessage: (requestParams?: RefreshDataRequestPayload) => void;
  sendFetchAnalyzedDataMessage: (requestParams?: FetchDataRequestPayload) => void;
  sendFetchBranchListMessage: () => void;
  sendFetchGithubInfo: () => void;
  sendUpdateThemeMessage: (theme: string) => void;
}
