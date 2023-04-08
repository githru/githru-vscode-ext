import type { EngineCommandNames } from "./EngineCommand";

export type EngineMessage = {
  commandName: EngineMessageCommandNames;
  payload?: string;
};

export type EngineMessageCommandNames = EngineCommandNames;

export interface EngineMessageEvent extends MessageEvent {
  data: EngineMessage;
}
