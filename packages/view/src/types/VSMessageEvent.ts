export interface VSMessageEvent extends MessageEvent {
  data: {
    command: CommandType;
    payload: string;
  };
}

export type CommandType = "refresh" | "changeBranchOption";
