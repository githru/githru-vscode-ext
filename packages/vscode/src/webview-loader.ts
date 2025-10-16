import * as path from "path";
import * as vscode from "vscode";

import { getTheme, setTheme } from "./setting-repository";
import type { ClusterNodesResult } from "./types/Node";

const ANALYZE_DATA_KEY = "memento_analyzed_data";

export default class WebviewLoader implements vscode.Disposable {
  private readonly _panel: vscode.WebviewPanel | undefined;

  constructor(
    private readonly extensionPath: string,
    context: vscode.ExtensionContext,
    fetcher: GithruFetcherMap
  ) {
    const { fetchClusterNodes, fetchBranches, fetchCurrentBranch, fetchGithubInfo } = fetcher;
    const viewColumn = vscode.ViewColumn.One;

    context.workspaceState.keys().forEach((key) => {
      context.workspaceState.update(key, undefined);
    });

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

        if (command === "refresh") {
          const requestPayload = payload ? JSON.parse(payload) : {};
          const { selectedBranch, commitCountPerPage, lastCommitId } = requestPayload;
          const currentBranch = selectedBranch ?? (await fetchCurrentBranch());

          const clusterData = await fetchClusterNodes(currentBranch, commitCountPerPage, lastCommitId, "refresh");
          analyzedData = {
            ...clusterData,
            isLoadMore: !!lastCommitId,
          };

          await this.respondToMessage({
            command,
            payload: analyzedData,
          });
        }

        if (command === "fetchAnalyzedData") {
          const requestPayload = payload ? JSON.parse(payload) : {};
          const { baseBranch, commitCountPerPage, lastCommitId } = requestPayload;
          const currentBranch = baseBranch ?? (await fetchCurrentBranch());

          const cacheKey = `${ANALYZE_DATA_KEY}_${currentBranch}_${lastCommitId || "firstPage"}`;

          const storedAnalyzedData = context.workspaceState.get<ClusterNodesResult>(cacheKey);

          if (storedAnalyzedData) {
            analyzedData = storedAnalyzedData;
          } else {
            const clusterData = await fetchClusterNodes(currentBranch, commitCountPerPage, lastCommitId);
            analyzedData = {
              ...clusterData,
              isLoadMore: !!lastCommitId,
            };
            context.workspaceState.update(cacheKey, analyzedData);
          }

          await this.respondToMessage({
            command,
            payload: analyzedData,
          });
        }

        if (command === "fetchBranchList") {
          const branches = await fetchBranches();
          await this.respondToMessage({
            ...message,
            payload: branches,
          });
        }

        if (command === "fetchGithubInfo") {
          const githubInfo = await fetchGithubInfo();
          await this.respondToMessage({
            ...message,
            payload: githubInfo,
          });
        }

        if (command === "updateTheme") {
          const themeInfo = payload && JSON.parse(payload);
          if (themeInfo.theme) {
            setTheme(themeInfo.theme);
          }
        }
      } catch (e) {
        console.error("An error occurred while processing the webview message:", e);
      }
    });
    //FIXME - For repositories where git exists, analyzedData is initially assigned as undefined.
    // if (!analyzedData) {
    //   this.dispose();
    //   throw new Error("Project not connected to Git.");
    // }
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

  private getWebviewContent(webview: vscode.Webview) {
    const reactAppPathOnDisk = vscode.Uri.file(path.join(this.extensionPath, "dist", "webviewApp.js"));
    const reactAppUri = webview.asWebviewUri(reactAppPathOnDisk);
    // const reactAppUri = reactAppPathOnDisk.with({ scheme: "vscode-resource" });

    const theme = getTheme();
    const returnString = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="initial-scale=1.0">
                    <title>githru-vscode-ext webview</title>
                    <script>
                        window.isProduction = true;   
                        window.theme = "${theme}";                       
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
  fetchClusterNodes: GithruFetcher<ClusterNodesResult, [string?, number?, string?, string?]>;
  fetchBranches: GithruFetcher<{ branchList: string[]; head: string | null }>;
  fetchCurrentBranch: GithruFetcher<string>;
  fetchGithubInfo: GithruFetcher<{ owner: string; repo: string }>;
};
