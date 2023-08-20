import { injectable } from "tsyringe";

import type { ClusterNode, IDEMessage, IDEMessageEvent } from "types";
import type { IDESentEvents } from "types/IDESentEvents";

import type IDEPort from "./IDEPort";
import { vscode } from "./VSCodeAPIWrapper";

@injectable()
export default class VSCodeIDEAdapter implements IDEPort {
  public addIDESentEventListener(events: IDESentEvents) {
    const onReceiveMessage = (e: IDEMessageEvent): void => {
      const responseMessage = e.data;
      switch (responseMessage.command) {
        case "fetchAnalyzedData":
          events.fetchAnalyzedData(JSON.parse(responseMessage.payload || "") as unknown as ClusterNode[]);
          break;
        case "getBranchList":
        default:
          console.log("Unknown Message");
      }
    };
    window.addEventListener("message", onReceiveMessage);
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
