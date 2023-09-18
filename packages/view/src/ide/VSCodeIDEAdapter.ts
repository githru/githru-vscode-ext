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
          return events.handleChangeAnalyzedData(payloadData);
        case "fetchBranchList":
          return events.handleChangeBranchList(payloadData);
        default:
          console.log("Unknown Message");
      }
    };
    window.addEventListener("message", onReceiveMessage);
  }

  public sendRefreshDataMessage(baseBranch?: string) {
    const message: IDEMessage = {
      command: "refresh",
      payload: JSON.stringify(baseBranch),
    };
    this.sendMessageToIDE(message);
  }

  public sendFetchAnalyzedDataMessage(baseBranch?: string) {
    const message: IDEMessage = {
      command: "fetchAnalyzedData",
      payload: JSON.stringify(baseBranch),
    };
    this.sendMessageToIDE(message);
  }

  public sendFetchBranchListMessage() {
    const message: IDEMessage = {
      command: "fetchBranchList",
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
