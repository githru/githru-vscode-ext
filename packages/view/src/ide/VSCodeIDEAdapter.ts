﻿import { injectable } from "inversify";

import type { FetchDataRequestPayload, IDEMessage, IDEMessageEvent } from "types";
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
        case "refresh":
          return events.handleChangeAnalyzedData(payloadData);
        case "fetchBranchList":
          return events.handleChangeBranchList(payloadData);
        case "fetchGithubInfo":
          return events.handleGithubInfo(payloadData);
        default:
          console.log("Unknown Message");
      }
    };
    window.addEventListener("message", onReceiveMessage);
  }

  public sendRefreshDataMessage(requestParams?: FetchDataRequestPayload) {
    const message: IDEMessage = {
      command: "refresh",
      payload: JSON.stringify(requestParams),
    };
    this.sendMessageToIDE(message);
  }

  public sendFetchAnalyzedDataMessage(requestParams?: FetchDataRequestPayload) {
    const message: IDEMessage = {
      command: "fetchAnalyzedData",
      payload: JSON.stringify(requestParams),
    };
    this.sendMessageToIDE(message);
  }

  public sendFetchBranchListMessage() {
    const message: IDEMessage = {
      command: "fetchBranchList",
    };
    this.sendMessageToIDE(message);
  }

  public sendFetchGithubInfo() {
    const message: IDEMessage = {
      command: "fetchGithubInfo",
    };
    this.sendMessageToIDE(message);
  }

  public sendUpdateThemeMessage(theme: string) {
    const message: IDEMessage = {
      command: "updateTheme",
      payload: JSON.stringify({ theme }),
    };
    this.sendMessageToIDE(message);
  }

  private sendMessageToIDE(message: IDEMessage) {
    vscode.postMessage(message);
  }
}
