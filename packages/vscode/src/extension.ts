import { AnalysisEngine } from "@githru-vscode-ext/analysis-engine";
import * as vscode from "vscode";
import { COMMAND_LAUNCH } from "./commands";
import { findGit, getBaseBranchName, getBranchNames, getGitConfig, getGitLog, getRepo } from "./utils/git.util";
import { mapClusterNodesFrom } from "./utils/csm.mapper";
import WebviewLoader from "./webview-loader";

let myStatusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
    const { subscriptions, extensionUri, extensionPath } = context;

    console.log('Congratulations, your extension "githru" is now active!');

    const disposable = vscode.commands.registerCommand(COMMAND_LAUNCH, async () => {
        const gitPath = (await findGit()).path;
        const currentWorkspacePath = vscode.workspace.workspaceFolders?.[0].uri.path;

        if (currentWorkspacePath === undefined) {
            throw new Error("Cannot find current workspace path");
        }

        const configuration = vscode.workspace.getConfiguration();
        const githubToken: string | undefined = configuration.get("githru.github.token");
        console.log("GitHubToken: ", githubToken);
        const gitLog = await getGitLog(gitPath, currentWorkspacePath);
        const gitConfig = await getGitConfig(gitPath, currentWorkspacePath, "origin");
        const { owner, repo } = getRepo(gitConfig);
        const branchNames = await getBranchNames(gitPath, currentWorkspacePath);
        const baseBranchName = getBaseBranchName(branchNames);

        const engine = new AnalysisEngine({ isDebugMode: true, gitLog, owner, repo, auth: githubToken, baseBranchName });
        const csmDict = await engine.analyzeGit();
        const clusterNodes = mapClusterNodesFrom(csmDict);
        const data = JSON.stringify(clusterNodes);

        subscriptions.push(new WebviewLoader(extensionUri, extensionPath, data));

        vscode.window.showInformationMessage("Hello Githru");
    });
    subscriptions.push(disposable);

    myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -10);
    myStatusBarItem.text = "githru";
    myStatusBarItem.command = COMMAND_LAUNCH;
    subscriptions.push(myStatusBarItem);

    // update status bar item once at start
    myStatusBarItem.show();
}

// this method is called when your extension is deactivated
export function deactivate() {}
