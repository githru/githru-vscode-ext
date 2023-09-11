﻿import { injectable } from "tsyringe";

import type { IDEMessage, IDEMessageEvent } from "types";
import type { IDESentEvents } from "types/IDESentEvents";

import fakeData from "../fake-assets/cluster-nodes.json";
import fakeBranchList from "../fake-assets/branch-list.json";

import type IDEPort from "./IDEPort";

@injectable()
export default class FakeIDEAdapter implements IDEPort {
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
    this.sendMessageToMe(message);
  }

  public sendFetchAnalyzedDataMessage(payload?: string) {
    const message: IDEMessage = {
      command: "fetchAnalyzedData",
      payload,
    };
    setTimeout(() => {
      this.sendMessageToMe(message);
    }, 3000);
  }

  public sendGetBranchListMessage() {
    const message: IDEMessage = {
      command: "getBranchList",
    };
    this.sendMessageToMe(message);
  }

  public setPrimaryColor(color: string) {
    sessionStorage.setItem("PRIMARY_COLOR", color);
    const message: IDEMessage = {
      command: "updatePrimaryColor",
    };
    this.sendMessageToMe(message);
  }

  private convertMessage(message: IDEMessage) {
    const { command } = message;

    switch (command) {
      case "fetchAnalyzedData":
        return {
          command,
          payload: JSON.stringify(fakeData),
        };
      case "getBranchList":
        return {
          command,
          payload: JSON.stringify(fakeBranchList),
        };
      case "updatePrimaryColor":
        return {
          command,
          payload: sessionStorage.getItem("PRIMARY_COLOR") as string,
        };
      default:
        return {
          command,
        };
    }
  }

  private sendMessageToMe(message: IDEMessage) {
    window.postMessage(this.convertMessage(message));
  }
}
