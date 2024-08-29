import * as path from "path";
import * as vscode from "vscode";

import { getPrimaryColor, setPrimaryColor } from "./setting-repository";
import type { ClusterNode } from "./types/Node";

const ANALYZE_DATA_KEY = "memento_analyzed_data";

export default class WebviewLoader implements vscode.Disposable {
  private readonly _panel: vscode.WebviewPanel | undefined;

  constructor(
    private readonly extensionPath: string,
    context: vscode.ExtensionContext,
    fetcher: GithruFetcherMap
  ) {
    const { fetchClusterNodes, fetchBranches, fetchCurrentBranch } = fetcher;

    const viewColumn = vscode.ViewColumn.One;

    this._panel = vscode.window.createWebviewPanel("WebviewLoader", "githru-view", viewColumn, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(path.join(this.extensionPath, "dist"))],
    });

    const icon_path = vscode.Uri.file(path.join(this.extensionPath, "images", "logo.png"));
    this._panel.iconPath = icon_path;
    let analyzedData;
    this._panel.webview.onDidReceiveMessage(async (message: { command: string; payload?: string }) => {
      try {
        const { command, payload } = message;

        if (command === "fetchAnalyzedData" || command === "refresh") {
          const baseBranchName = (payload && JSON.parse(payload)) ?? (await fetchCurrentBranch());
          // Disable Cache temporarily
          // const storedAnalyzedData = context.workspaceState.get<ClusterNode[]>(`${ANALYZE_DATA_KEY}_${baseBranchName}`);

          // if (!storedAnalyzedData) {
          try {
            analyzedData = await fetchClusterNodes(baseBranchName);
            context.workspaceState.update(`${ANALYZE_DATA_KEY}_${baseBranchName}`, analyzedData);

            const resMessage = {
              command,
              payload: analyzedData,
            };

            await this.respondToMessage(resMessage);
          } catch (e) {
            console.error("Error fetching analyzed data:", e);
            throw e;
          }
        }

        if (command === "fetchBranchList") {
          const branches = await fetchBranches();
          await this.respondToMessage({
            ...message,
            payload: branches,
          });
        }

        if (command === "updatePrimaryColor") {
          const colorCode = payload && JSON.parse(payload);
          if (colorCode.primary) {
            setPrimaryColor(colorCode.primary);
          }
        }
      } catch (e) {
        console.error("An error occurred while processing the webview message:", e);
      }
    });
    if (!analyzedData) {
      this.dispose();
      throw new Error("Project not connected to Git.");
    }
    this._panel.webview.html = this.getWebviewContent(this._panel.webview);
  }

  dispose() {
    this._panel?.dispose();
  }

  getPanel() {
    return this._panel;
  }

  private async respondToMessage(message: { command: string; payload: unknown }) {
    this._panel?.webview.postMessage({
      command: message.command,
      // TODO v2: need to re-fetch git data on behalf of cluster option
      payload: JSON.stringify(message.payload),
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
  public setGlobalOwnerAndRepo(owner: string, repo: string) {
    if (this._panel) {
      this._panel.webview.postMessage({
        command: "setGlobalOwnerAndRepo",
        data: { owner, repo },
      });
    }
  }
}

type GithruFetcher<D = unknown, P extends unknown[] = []> = (...params: P) => Promise<D>;
type GithruFetcherMap = {
  fetchClusterNodes: GithruFetcher<ClusterNode[], [string]>;
  fetchBranches: GithruFetcher<{ branchList: string[]; head: string | null }>;
  fetchCurrentBranch: GithruFetcher<string>;
};
