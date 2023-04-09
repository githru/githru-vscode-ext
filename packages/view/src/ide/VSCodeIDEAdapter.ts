import { injectable } from "tsyringe";

import type { ClusterNode, EngineCommand } from "types";
import type { EngineMessageEvent } from "types/EngineMessage";

import type IDEPort from "./IDEPort";
import { vscode } from "./VSCodeAPIWrapper";

@injectable()
export default class VSCodeIDEAdapter implements IDEPort {
  public addAllEventListener(
    fetchAnalyzedData: (analyzedData: ClusterNode[]) => void
  ) {
    const onReceiveMessage = (e: EngineMessageEvent): void => {
      const response = e.data;
      if (response.commandName === "fetchAnalyzedData") {
        fetchAnalyzedData(response.payload as unknown as ClusterNode[]);
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
    vscode.postMessage(command);
  }
}
