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
  | "fetchMoreGitLog"
  | "updatePrimaryColor";
