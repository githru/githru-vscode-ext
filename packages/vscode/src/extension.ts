import { AnalysisEngine } from "@githru-vscode-ext/analysis-engine";
import * as vscode from "vscode";

import { COMMAND_GET_ACCESS_TOKEN, COMMAND_LAUNCH } from "./commands";
import { GithubTokenUndefinedError, WorkspacePathUndefinedError } from "./errors/ExtensionError";
import { getGithubToken, setGithubToken } from "./setting-repository";
import { mapClusterNodesFrom } from "./utils/csm.mapper";
import { findGit, getBaseBranchName, getBranchNames, getGitConfig, getGitLog, getRepo } from "./utils/git.util";
import WebviewLoader from "./webview-loader";

let myStatusBarItem: vscode.StatusBarItem;

function normalizeFsPath(fsPath: string) {
  return fsPath.replace(/\\/g, "/");
}

export function activate(context: vscode.ExtensionContext) {
  const { subscriptions, extensionUri, extensionPath, secrets } = context;

  console.log('Congratulations, your extension "githru" is now active!');

  const disposable = vscode.commands.registerCommand(COMMAND_LAUNCH, async () => {
    try {
      const gitPath = (await findGit()).path;

      const currentWorkspaceUri = vscode.workspace.workspaceFolders?.[0].uri;
      if (!currentWorkspaceUri) {
        throw new WorkspacePathUndefinedError("Cannot find current workspace path");
      }

      const currentWorkspacePath = normalizeFsPath(currentWorkspaceUri.fsPath);

      const branchNames = await getBranchNames(gitPath, currentWorkspacePath);
      const initialBaseBranchName = getBaseBranchName(branchNames);

      const githubToken: string | undefined = await getGithubToken(secrets);
      if (!githubToken) {
        throw new GithubTokenUndefinedError(
          "Cannot find your GitHub token. For more details, please refer to",
          "https://docs.github.com/en/enterprise-server@3.6/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens"
        );
      }

      const fetchClusterNodes = async (baseBranchName = initialBaseBranchName) => {
        const gitLog = await getGitLog(gitPath, currentWorkspacePath);
        const gitConfig = await getGitConfig(gitPath, currentWorkspacePath, "origin");
        const { owner, repo } = getRepo(gitConfig);
        const engine = new AnalysisEngine({
          isDebugMode: true,
          gitLog,
          owner,
          repo,
          auth: githubToken,
          baseBranchName,
        });
        const csmDict = await engine.analyzeGit();
        const clusterNodes = mapClusterNodesFrom(csmDict);
        const data = JSON.stringify(clusterNodes);
        return data;
      };
      const fetchBranchList = () => JSON.stringify(branchNames);
      const webLoader = new WebviewLoader(extensionUri, extensionPath, fetchClusterNodes, fetchBranchList);

      subscriptions.push(webLoader);
      vscode.window.showInformationMessage("Hello Githru");
    } catch (error) {
      if (error instanceof GithubTokenUndefinedError) {
        vscode.window.showInformationMessage(error.message, error.helpUrl).then((selection) => {
          if (selection === (error as GithubTokenUndefinedError).helpUrl) {
            vscode.env.openExternal(vscode.Uri.parse((error as GithubTokenUndefinedError).helpUrl));
          }
        });
      } else if (error instanceof WorkspacePathUndefinedError) {
        vscode.window.showErrorMessage(error.message);
      } else {
        vscode.window.showErrorMessage((error as Error).message);
      }
    }
  });

  const getAccessToken = vscode.commands.registerCommand(COMMAND_GET_ACCESS_TOKEN, async () => {
    const defaultGithubToken = await getGithubToken(secrets);

    const newGithubToken = await vscode.window.showInputBox({
      title: "Type or paste your Github access token value.",
      placeHolder: "Type valid token here!",
      value: defaultGithubToken ?? "",
    });

    if (!newGithubToken) throw new Error("Cannot get users' access token properly");

    setGithubToken(secrets, newGithubToken);
  });

  subscriptions.concat([disposable, getAccessToken]);

  myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -10);
  myStatusBarItem.text = "githru";
  myStatusBarItem.command = COMMAND_LAUNCH;
  subscriptions.push(myStatusBarItem);

  // update status bar item once at start
  myStatusBarItem.show();
}

// this method is called when your extension is deactivated
export function deactivate() {}
