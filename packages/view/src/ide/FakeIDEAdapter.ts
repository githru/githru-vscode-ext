import { injectable } from "tsyringe";

import type { ClusterNode, IDEMessage, IDEMessageEvent } from "types";
import type { IDESentEvents } from "types/IDESentEvents";

import fakeData from "../fake-assets/cluster-nodes.json";

import type IDEPort from "./IDEPort";

@injectable()
export default class FakeIDEAdapter implements IDEPort {
  public addIDESentEventListener(events: IDESentEvents) {
    const onReceiveMessage = (e: IDEMessageEvent): void => {
      const responseMessage = e.data;
      if (responseMessage.command === "fetchAnalyzedData") {
        const fetchedData = responseMessage.payload as unknown as ClusterNode[];
        events.fetchAnalyzedData(fetchedData);
      }
    };

    window.addEventListener("message", onReceiveMessage);
  }

  public sendFetchAnalyzedDataMessage() {
    const message: IDEMessage = {
      command: "fetchAnalyzedData",
    };
    setTimeout(() => {
      this.sendMessageToMe(message);
    }, 3000);
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
          command: command,
          payload: fakeData as unknown as string,
        };
      case "updatePrimaryColor":
        return {
          command: command,
          payload: sessionStorage.getItem("PRIMARY_COLOR") as string,
        };
      default:
        return {
          command: command,
        };
    }
  }

  private sendMessageToMe(message: IDEMessage) {
    window.postMessage(this.convertMessage(message));
  }
}
