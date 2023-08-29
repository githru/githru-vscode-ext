import * as path from "path";
import * as vscode from "vscode";

import { getPrimaryColor, setPrimaryColor } from "./setting-repository";

const ANALYZE_DATA_KEY = "memento_analyzed_data";

export default class WebviewLoader implements vscode.Disposable {
  private readonly _panel: vscode.WebviewPanel | undefined;

  constructor(
    private readonly extensionPath: string,
    context: vscode.ExtensionContext,
    parseCommit: (baseBranchName?: string) => Promise<string>,
    getAllBranches: () => string
  ) {
    const viewColumn = vscode.ViewColumn.One;

    this._panel = vscode.window.createWebviewPanel("WebviewLoader", "githru-view", viewColumn, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(path.join(this.extensionPath, "dist"))],
    });

    const icon_path = vscode.Uri.file(path.join(this.extensionPath, "images", "logo.png"));
    this._panel.iconPath = icon_path;

    this._panel.webview.onDidReceiveMessage(async (message: { command: string; payload: unknown }) => {
      const { command, payload } = message;

      if (command === "fetchAnalyzedData" || command === "refresh") {
        const storedAnalyzedData = context.workspaceState.get(ANALYZE_DATA_KEY);
        const resMessage = message;

        if (!storedAnalyzedData) {
          const baseBranchName = payload ? JSON.parse(payload as string) : undefined;
          const data = await parseCommit(baseBranchName);
          context.workspaceState.update(ANALYZE_DATA_KEY, data);
          resMessage.payload = data;
        }
        resMessage.payload = storedAnalyzedData;
        await this.respondToMessage(resMessage);
      }

      if (command === "getBranchList") {
        const branches = getAllBranches();
        await this.respondToMessage({
          ...message,
          payload: branches,
        });
      }
      if (command === "updatePrimaryColor") {
        const colorCode = JSON.parse(payload as string);
        if (colorCode.primary) {
          setPrimaryColor(colorCode.primary);
        }
      }
    });

    this._panel.webview.html = this.getWebviewContent(this._panel.webview);
  }

  dispose() {
    this._panel?.dispose();
  }

  private async respondToMessage(message: { command: string; payload: unknown }) {
    this._panel?.webview.postMessage({
      command: message.command,
      // TODO v2: need to re-fetch git data on behalf of cluster option
      payload: message.payload,
    });
  }

  private getWebviewContent(webview: vscode.Webview): string {
    const reactAppPathOnDisk = vscode.Uri.file(path.join(this.extensionPath, "dist", "webviewApp.js"));
    const reactAppUri = webview.asWebviewUri(reactAppPathOnDisk);
    // const reactAppUri = reactAppPathOnDisk.with({ scheme: "vscode-resource" });

    const primaryColor = getPrimaryColor();

    const returnString = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="initial-scale=1.0">
                    <title>githru-vscode-ext webview</title>
                    <script>
                        window.isProduction = true;   
                        window.primaryColor = "${primaryColor}";                     
                    </script>
                </head>
                <body>
                    <div id="root"/>
                    <script src="${reactAppUri}"></script>
                    <script>
                        const vscode = acquireVsCodeApi();
                    </script>
                </body>
            </html>
        `;
    return returnString;
  }
}
