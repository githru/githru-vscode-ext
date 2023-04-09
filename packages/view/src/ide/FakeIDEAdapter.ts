import { injectable } from "tsyringe";

import type { ClusterNode, EngineCommand } from "types";
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
      if (response.commandName === "fetchAnalyzedData") {
        const fetchedData = response.payload as unknown as ClusterNode[];
        fetchAnalyzedData(fetchedData);
      }
    };

    window.addEventListener("message", onReceiveMessage);
  }

  public sendFetchAnalyzedDataCommand() {
    const command: EngineCommand = {
      commandName: "fetchAnalyzedData",
    };
    this.executeCommand(command);
  }

  private executeCommand(command: EngineCommand) {
    if (command.commandName === "fetchAnalyzedData") {
      const message: EngineMessage = {
        commandName: command.commandName,
        payload: fakeData as unknown as string,
      };

      window.postMessage(message);
    }
  }
}
