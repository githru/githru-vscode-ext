import type ExecuteIDECommandsRepository from "./ExecuteIDECommands";
import type { IDEMessage } from "./ExecuteIDECommands";
import { vscode } from "./VSCodeAPIWrapper";
import type VSCodeAPIWrapper from "./VSCodeAPIWrapper";

export class ExecuteIdeCommandsImpl implements ExecuteIDECommandsRepository {
  constructor(private vscodeApi: VSCodeAPIWrapper) {
    this.vscodeApi = vscode;
  }

  public openDocument(uri: string) {
    const msg: IDEMessage = {
      command: "openDocument",
      uri: uri,
    };

    this.vscodeApi.postMessage(msg);
  }
}
