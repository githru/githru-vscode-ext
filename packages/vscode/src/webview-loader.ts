import { AnalysisEngine } from "@githru-vscode-ext/analysis-engine";
import * as path from "path";
import * as vscode from "vscode";

import { WorkspacePathUndefinedError } from "./errors/ExtensionError";
import { getPrimaryColor, setPrimaryColor } from "./setting-repository";
import { mapClusterNodesFrom } from "./utils/csm.mapper";
import {
  findGit,
  getBranches,
  getCurrentBranchName,
  getDefaultBranchName,
  getGitConfig,
  getGitLog,
  getRepo,
} from "./utils/git.util";

const ANALYZE_DATA_KEY = "memento_analyzed_data";

function normalizeFsPath(fsPath: string) {
  return fsPath.replace(/\\/g, "/");
}

export default class WebviewLoader implements vscode.Disposable {
  private readonly _panel: vscode.WebviewPanel | undefined;
  githubToken: string | undefined;
  gitPath: string | undefined;
  constructor(
    private readonly extensionPath: string,
    context: vscode.ExtensionContext,
    githubToken: string | undefined
  ) {
    const viewColumn = vscode.ViewColumn.One;
    this.githubToken = githubToken;

    this._panel = vscode.window.createWebviewPanel("WebviewLoader", "githru-view", viewColumn, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(path.join(this.extensionPath, "dist"))],
    });

    const icon_path = vscode.Uri.file(path.join(this.extensionPath, "images", "logo.png"));
    this._panel.iconPath = icon_path;

    this._panel.webview.onDidReceiveMessage(async (message: { command: string; payload?: string }) => {
      const { command, payload } = message;

      if (command === "fetchAnalyzedData" || command === "refresh") {
        const baseBranchName = (payload && JSON.parse(payload)) ?? (await this.fetchCurrentBranch());
        // Disable Cache temporarily
        // const storedAnalyzedData = context.workspaceState.get<ClusterNode[]>(`${ANALYZE_DATA_KEY}_${baseBranchName}`);
        // if (!storedAnalyzedData) {

        const analyzedData = await this.fetchClusterNodes(baseBranchName);
        context.workspaceState.update(`${ANALYZE_DATA_KEY}_${baseBranchName}`, analyzedData);

        const resMessage = {
          command,
          payload: analyzedData,
        };

        await this.respondToMessage(resMessage);
      }

      if (command === "fetchBranchList") {
        const branches = await this.fetchBranches();
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
    });

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

  private getCurrentWorkspacePath() {
    const currentWorkspaceUri = vscode.workspace.workspaceFolders?.[0].uri;
    if (!currentWorkspaceUri) {
      throw new WorkspacePathUndefinedError("Cannot find current workspace path");
    }
    return normalizeFsPath(currentWorkspaceUri.fsPath);
  }

  private async getGitPath() {
    return (await findGit()).path;
  }

  private async fetchBranches() {
    try {
      return await getBranches(await this.getGitPath(), this.getCurrentWorkspacePath());
    } catch (e) {
      console.debug(e);
    }
  }

  private async fetchCurrentBranch() {
    let branchName;
    try {
      branchName = await getCurrentBranchName(await this.getGitPath(), this.getCurrentWorkspacePath());
    } catch (error) {
      console.error(error);
    }

    if (!branchName) {
      const branchList = (await this.fetchBranches())?.branchList;
      branchName = getDefaultBranchName(branchList || []);
    }
    return branchName;
  }

  private async fetchClusterNodes(baseBranchName?: string) {
    const currentWorkspaceUri = vscode.workspace.workspaceFolders?.[0].uri;
    if (!currentWorkspaceUri) {
      throw new WorkspacePathUndefinedError("Cannot find current workspace path");
    }

    if (!baseBranchName) {
      baseBranchName = await this.fetchCurrentBranch();
    }
    const gitLog = await getGitLog(await this.getGitPath(), this.getCurrentWorkspacePath());
    const gitConfig = await getGitConfig(await this.getGitPath(), this.getCurrentWorkspacePath(), "origin");
    const { owner, repo } = getRepo(gitConfig);
    const engine = new AnalysisEngine({
      isDebugMode: true,
      gitLog,
      owner,
      repo,
      auth: this.githubToken,
      baseBranchName,
    });

    const { isPRSuccess, csmDict } = await engine.analyzeGit();
    if (isPRSuccess) console.log("crawling PR failed");

    return mapClusterNodesFrom(csmDict);
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
