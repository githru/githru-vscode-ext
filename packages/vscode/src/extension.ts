import { AnalysisEngine } from "@githru-vscode-ext/analysis-engine";
import * as vscode from "vscode";

import { COMMAND_LAUNCH, COMMAND_LOGIN_WITH_GITHUB, COMMAND_RESET_GITHUB_AUTH } from "./commands";
import { Credentials } from "./credentials";
import { GithubTokenUndefinedError, WorkspacePathUndefinedError } from "./errors/ExtensionError";
import { deleteGithubToken, getGithubToken, setGithubToken } from "./setting-repository";
import { ClusterNodesResult } from "./types/Node";
import { mapClusterNodesFrom } from "./utils/csmMapper";
import {
  fetchGitLogInParallel,
  findGit,
  getBranches,
  getCurrentBranchName,
  getDefaultBranchName,
  getGitConfig,
  getGitLog,
  getRepo,
} from "./utils/gitUtil";
import WebviewLoader from "./webview-loader";

let myStatusBarItem: vscode.StatusBarItem;
const projectName = "githru";

function normalizeFsPath(fsPath: string) {
  return fsPath.replace(/\\/g, "/");
}

export async function activate(context: vscode.ExtensionContext) {
  const { subscriptions, extensionPath, secrets } = context;
  const credentials = new Credentials();
  let currentPanel: vscode.WebviewPanel | undefined = undefined;
  let engine: AnalysisEngine | undefined;
  await credentials.initialize(context);

  console.log('Congratulations, your extension "githru" is now active!');

  const disposable = vscode.commands.registerCommand(COMMAND_LAUNCH, async () => {
    if (context.extensionMode === vscode.ExtensionMode.Development) {
      console.time("Githru-Launch-Time");
    }
    myStatusBarItem.text = `$(sync~spin) ${projectName}`;
    try {
      console.debug("current Panel = ", currentPanel, currentPanel?.onDidDispose);
      if (currentPanel) {
        currentPanel.reveal();
        myStatusBarItem.text = `$(check) ${projectName}`;
        return;
      }

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
      const gitConfig = await getGitConfig(gitPath, currentWorkspacePath, "origin");
      const fetchGithubInfo = async () => getRepo(gitConfig);

      const fetchCurrentBranch = async () => {
        let branchName = await getCurrentBranchName(gitPath, currentWorkspacePath).catch(() => null);
        if (!branchName) {
          const branchList = (await fetchBranches()).branchList;
          branchName = getDefaultBranchName(branchList);
        }
        return branchName;
      };

      const initialBaseBranchName = await fetchCurrentBranch();

      const fetchClusterNodes = async (
        baseBranchName = initialBaseBranchName,
        perPage?: number,
        lastCommitId?: string
      ): Promise<ClusterNodesResult> => {
        // Cache engine
        if (!engine || engine.getBaseBranchName() !== baseBranchName) {
          const workerPath = vscode.Uri.joinPath(context.extensionUri, "dist", "worker.js").fsPath;
          const gitLog = await fetchGitLogInParallel(gitPath, currentWorkspacePath, workerPath);
          const { owner, repo } = getRepo(gitConfig);
          engine = new AnalysisEngine({
            isDebugMode: true,
            gitLog,
            owner,
            repo,
            auth: githubToken,
            baseBranchName,
          });
          await engine.init();
        }

        if (!engine) {
          throw new Error("Analysis engine is not initialized.");
        }

        const analysisResult = await engine.analyzeGit(perPage, lastCommitId);

        if (analysisResult.isPRSuccess) console.log("crawling PR Success");

        const clusterNodes = mapClusterNodesFrom(analysisResult.csmDict);

        return {
          clusterNodes: clusterNodes,
          isLastPage: analysisResult.isLastPage,
          nextCommitId: analysisResult.nextCommitId,
          isPRSuccess: analysisResult.isPRSuccess,
        };
      };

      const webLoader = new WebviewLoader(extensionPath, context, {
        fetchClusterNodes,
        fetchBranches,
        fetchCurrentBranch,
        fetchGithubInfo,
      });

      currentPanel = webLoader.getPanel();

      currentPanel?.onDidDispose(
        () => {
          currentPanel = undefined;
          myStatusBarItem.text = projectName;
        },
        null,
        context.subscriptions
      );

      subscriptions.push(webLoader);
      myStatusBarItem.text = `$(check) ${projectName}`;
      if (context.extensionMode === vscode.ExtensionMode.Development) {
        console.timeEnd("Githru-Launch-Time");
      }
      vscode.window.showInformationMessage("Hello Githru");
    } catch (error) {
      if (error instanceof GithubTokenUndefinedError) {
        vscode.window.showErrorMessage(error.message);
        vscode.commands.executeCommand(COMMAND_LOGIN_WITH_GITHUB);
      } else if (error instanceof WorkspacePathUndefinedError) {
        vscode.window.showErrorMessage(error.message);
      } else {
        vscode.window.showErrorMessage((error as Error).message);
        myStatusBarItem.text = `$(diff-review-close) ${projectName}`;
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

  const resetGithubAuth = vscode.commands.registerCommand(COMMAND_RESET_GITHUB_AUTH, async () => {
    await deleteGithubToken(secrets);
    vscode.window.showInformationMessage(`Github Authentication reset.`);
  });

  subscriptions.concat([disposable, loginWithGithub, resetGithubAuth]);

  myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -10);
  myStatusBarItem.text = projectName;
  myStatusBarItem.command = COMMAND_LAUNCH;
  subscriptions.push(myStatusBarItem);

  // update status bar item once at start
  myStatusBarItem.show();
}

// this method is called when your extension is deactivated
export function deactivate() {}
