import { injectable } from "tsyringe";

import type { ClusterNode, EngineCommand, EngineCommandNames } from "types";
import type { EngineMessage, EngineMessageEvent } from "types/EngineMessage";

import fakeData from "../fake-assets/cluster-nodes.json";

import type IDEPort from "./IDEPort";

@injectable()
export default class FakeIDEAdapter implements IDEPort {
  public addAllEventListener(
    fetchAnalyzedData: (analyzedData: ClusterNode[]) => void
  ) {
    const onReceiveMessage = (e: EngineMessageEvent): void => {
      const response = e.data;
      if (response.command === "fetchAnalyzedData") {
        const fetchedData = response.payload as unknown as ClusterNode[];
        fetchAnalyzedData(fetchedData);
      }
    };

    window.addEventListener("message", onReceiveMessage);
  }

  public sendFetchAnalyzedDataCommand() {
    const command: EngineCommand = {
      command: "fetchAnalyzedData",
    };
    setTimeout(() => {
      this.executeCommand(command);
    }, 3000);
  }

  public setPrimaryColor(color: string) {
    sessionStorage.setItem("PRIMARY_COLOR", color);
    const command: EngineCommand = {
      command: "updatePrimaryColor",
    };
    this.executeCommand(command);
  }

  private getResponseMessage(commandName: EngineCommandNames) {
    switch (commandName) {
      case "fetchAnalyzedData":
        return {
          command: commandName,
          payload: fakeData as unknown as string,
        };
      case "updatePrimaryColor":
        return {
          command: commandName,
          payload: sessionStorage.getItem("PRIMARY_COLOR") as string,
        };
      default:
        return {
          command: commandName,
        };
    }
  }

  private executeCommand(command: EngineCommand) {
    const message: EngineMessage = this.getResponseMessage(command.command);
    window.postMessage(message);
  }
}
