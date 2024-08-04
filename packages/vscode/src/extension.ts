import * as vscode from "vscode";

import { COMMAND_LAUNCH, COMMAND_LOGIN_WITH_GITHUB, COMMAND_RESET_GITHUB_AUTH } from "./commands";
import { Credentials } from "./credentials";
import { GithubTokenUndefinedError, WorkspacePathUndefinedError } from "./errors/ExtensionError";
import { deleteGithubToken, getGithubToken, setGithubToken } from "./setting-repository";
import WebviewLoader from "./webview-loader";

let myStatusBarItem: vscode.StatusBarItem;
const projectName = "githru";

export async function activate(context: vscode.ExtensionContext) {
  const { subscriptions, extensionPath, secrets } = context;
  const credentials = new Credentials();ㅁ
  let currentPanel: vscode.WebviewPanel | undefined = undefined;

  await credentials.initialize(context);

  console.log('Congratulations, your extension "githru" is now active!');

  const disposable = vscode.commands.registerCommand(COMMAND_LAUNCH, async () => {
    myStatusBarItem.text = `$(sync~spin) ${projectName}`;
    try {
      console.debug("current Panel = ", currentPanel, currentPanel?.onDidDispose);
      if (currentPanel) {
        currentPanel.reveal();
        myStatusBarItem.text = `$(check) ${projectName}`;
        return;
      }

      const currentWorkspaceUri = vscode.workspace.workspaceFolders?.[0].uri;
      if (!currentWorkspaceUri) {
        throw new WorkspacePathUndefinedError("Cannot find current workspace path");
      }

      const githubToken: string | undefined = await getGithubToken(secrets);
      if (!githubToken) {
        throw new GithubTokenUndefinedError("Cannot find your GitHub token. Retrying github authentication...");
      }

      const webLoader = new WebviewLoader(extensionPath, context, githubToken);
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
