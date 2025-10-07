export type IDEMessage = {
  command: IDEMessageCommandNames;
  payload?: string;
};

export interface IDEMessageEvent extends MessageEvent {
  data: IDEMessage;
}

export type IDEMessageCommandNames =
  | "refresh"
  | "fetchAnalyzedData"
  | "fetchBranchList"
  | "fetchCurrentBranch"
  | "fetchGithubInfo"
  | "updateTheme";

export type RefreshDataRequestPayload = {
  selectedBranch?: string;
  perPage?: number;
  lastCommitId?: string;
};

export type FetchDataRequestPayload = {
  baseBranch?: string;
  perPage?: number;
  lastCommitId?: string;
};
