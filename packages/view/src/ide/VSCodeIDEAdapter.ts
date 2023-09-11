﻿import { injectable } from "tsyringe";

import type { IDEMessage, IDEMessageEvent } from "types";
import type { IDESentEvents } from "types/IDESentEvents";

import type IDEPort from "./IDEPort";
import { vscode } from "./VSCodeAPIWrapper";

@injectable()
export default class VSCodeIDEAdapter implements IDEPort {
  public addIDESentEventListener(events: IDESentEvents) {
    const onReceiveMessage = (e: IDEMessageEvent): void => {
      const responseMessage = e.data;
      const { command, payload } = responseMessage;
      const payloadData = payload ? JSON.parse(payload) : undefined;

      switch (command) {
        case "fetchAnalyzedData":
          return events.fetchAnalyzedData(payloadData);
        case "getBranchList":
          return events.fetchBranchList(payloadData);
        default:
          console.log("Unknown Message");
      }
    };
    window.addEventListener("message", onReceiveMessage);
  }

  public sendRefreshDataMessage(payload?: string) {
    const message: IDEMessage = {
      command: "refresh",
      payload,
    };
    this.sendMessageToIDE(message);
  }

  public sendFetchAnalyzedDataMessage(payload?: string) {
    const message: IDEMessage = {
      command: "fetchAnalyzedData",
      payload,
    };
    this.sendMessageToIDE(message);
  }

  public sendGetBranchListMessage() {
    const message: IDEMessage = {
      command: "getBranchList",
    };
    this.sendMessageToIDE(message);
  }

  public setPrimaryColor(color: string) {
    const message: IDEMessage = {
      command: "updatePrimaryColor",
      payload: JSON.stringify({ primary: color }),
    };
    this.sendMessageToIDE(message);
  }

  private sendMessageToIDE(message: IDEMessage) {
    vscode.postMessage(message);
  }
}
