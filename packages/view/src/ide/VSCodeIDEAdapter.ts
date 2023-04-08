import type { Dispatch } from "react";
import type React from "react";
import { injectable } from "tsyringe";

import type { ClusterNode, EngineCommand } from "types";
import type { EngineMessageEvent } from "types/EngineMessage";

import fakeData from "../fake-assets/cluster-nodes.json";

import type IDEPort from "./IDEPort";
import { vscode } from "./VSCodeAPIWrapper";

@injectable()
export default class VSCodeIDEAdapter implements IDEPort {
  public addAllEventListener(
    setData: Dispatch<React.SetStateAction<ClusterNode[]>>
  ) {
    const onReceiveMessage = (e: EngineMessageEvent): void => {
      const response = e.data;
      if (response.commandName === "fetchAnalyzedData") {
        setData(response.payload as unknown as ClusterNode[]);
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

  public fetchAnalyzedData() {
    return fakeData as unknown as ClusterNode[];
  }
}
