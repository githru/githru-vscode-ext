/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Dispatch } from "react";
import type React from "react";
import { injectable } from "tsyringe";

import type { ClusterNode, EngineCommand } from "types";
import type { EngineMessageEvent } from "types/EngineMessage";

// import fakeData from "../fake-assets/cluster-nodes.json";

import type IDEPort from "./IDEPort";

@injectable()
export default class FakeIDEAdapter implements IDEPort {
  public addAllEventListener(
    setData: Dispatch<React.SetStateAction<ClusterNode[]>>
  ) {
    const onReceiveMessage = (e: EngineMessageEvent): void => {
      const response = e.data;
      if (response.commandName === "fetchAnalyzedData") {
        setData(response.payload as unknown as ClusterNode[]);
      }
    };

    console.log("addAllEventListener!");
    window.addEventListener("message", onReceiveMessage);
  }

  public sendFetchAnalyzedDataCommand() {
    console.log("Received: sendFetchAnalyzedDataCommand");
    const command: EngineCommand = {
      commandName: "fetchAnalyzedData",
    };
    this.executeCommand(command);
  }

  private executeCommand(command: EngineCommand) {
    console.log("executeCommand:", command);
    // if (command.commandName === "fetchAnalyzedData") {
    //   const message: EngineMessage = {
    //     commandName: command.commandName,
    //     payload: fakeData as unknown as string,
    //   };

    //   window.postMessage(message);
    // }
  }
}
