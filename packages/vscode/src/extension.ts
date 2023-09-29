import { AnalysisEngine } from "@githru-vscode-ext/analysis-engine";
import * as vscode from "vscode";

import { COMMAND_LAUNCH, COMMAND_LOGIN_WITH_GITHUB } from "./commands";
import { Credentials } from "./credentials";
import { GithubTokenUndefinedError, WorkspacePathUndefinedError } from "./errors/ExtensionError";
import { getGithubToken, setGithubToken,  } from "./setting-repository";
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
import WebviewLoader from "./webview-loader";

let myStatusBarItem: vscode.StatusBarItem;

function normalizeFsPath(fsPath: string) {
  return fsPath.replace(/\\/g, "/");
}

export async function activate(context: vscode.ExtensionContext) {
  const { subscriptions, extensionPath, secrets } = context;
  const credentials = new Credentials();
  await credentials.initialize(context);

  console.log('Congratulations, your extension "githru" is now active!');

  const disposable = vscode.commands.registerCommand(COMMAND_LAUNCH, async () => {
    try {
      const gitPath = (await findGit()).path;

      const currentWorkspaceUri = vscode.workspace.workspaceFolders?.[0].uri;
      if (!currentWorkspaceUri) {
        throw new WorkspacePathUndefinedError("Cannot find current workspace path");
      }

      const currentWorkspacePath = normalizeFsPath(currentWorkspaceUri.fsPath);

      const githubToken: string | undefined = await getGithubToken(secrets);
      if (!githubToken) {
        throw new GithubTokenUndefinedError("Cannot find your GitHub token. Retrying github authentication...");
      }

      const fetchBranches = async () => await getBranches(gitPath, currentWorkspacePath);
      const fetchCurrentBranch = async () => {
        let branchName = await getCurrentBranchName(gitPath, currentWorkspacePath);
        if (!branchName) {
          const branchList = (await fetchBranches()).branchList;
          branchName = getDefaultBranchName(branchList);
        }
        return branchName;
      };

      const initialBaseBranchName = await fetchCurrentBranch();
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

        const { isPRSuccess, csmDict } = await engine.analyzeGit();
        if (isPRSuccess) console.log("crawling PR failed");

        return mapClusterNodesFrom(csmDict);
      };

      const webLoader = new WebviewLoader(extensionPath, context, {
        fetchClusterNodes,
        fetchBranches,
        fetchCurrentBranch,
      });

      subscriptions.push(webLoader);
      vscode.window.showInformationMessage("Hello Githru");
    } catch (error) {
      if (error instanceof GithubTokenUndefinedError) {
        vscode.window.showErrorMessage(error.message);
        vscode.commands.executeCommand(COMMAND_LOGIN_WITH_GITHUB);
      } else if (error instanceof WorkspacePathUndefinedError) {
        vscode.window.showErrorMessage(error.message);
      } else {
        vscode.window.showErrorMessage((error as Error).message);
      }
    }
  });

  const loginWithGithub = vscode.commands.registerCommand(COMMAND_LOGIN_WITH_GITHUB, async () => {
    const octokit = await credentials.getOctokit();
    const userInfo = await octokit.users.getAuthenticated();
    const auth = await credentials.getAuth();

    await setGithubToken(secrets, auth.token);
    vscode.window.showInformationMessage(`Logged into GitHub as ${userInfo.data.login}`);
    vscode.commands.executeCommand(COMMAND_LAUNCH);
  });

  subscriptions.concat([disposable, loginWithGithub]);

  myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -10);
  myStatusBarItem.text = "githru";
  myStatusBarItem.command = COMMAND_LAUNCH;
  subscriptions.push(myStatusBarItem);

  // update status bar item once at start
  myStatusBarItem.show();
}

// this method is called when your extension is deactivated
export function deactivate() {}
