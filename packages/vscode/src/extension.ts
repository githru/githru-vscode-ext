import { AnalysisEngine } from "@githru-vscode-ext/analysis-engine";
import * as vscode from "vscode";
import { COMMAND_GET_ACCESS_TOKEN, COMMAND_LAUNCH } from "./commands";
import { findGit, getBaseBranchName, getBranchNames, getGitConfig, getGitLog, getRepo } from "./utils/git.util";
import { mapClusterNodesFrom } from "./utils/csm.mapper";
import WebviewLoader from "./webview-loader";

let myStatusBarItem: vscode.StatusBarItem;

const getGithubToken = () : string | undefined => {
    const configuration = vscode.workspace.getConfiguration();
    return configuration.get("githru.github.token");
}

export function activate(context: vscode.ExtensionContext) {
    const { subscriptions, extensionUri, extensionPath } = context;

    console.log('Congratulations, your extension "githru" is now active!');

    const disposable = vscode.commands.registerCommand(COMMAND_LAUNCH, async () => {
        const gitPath = (await findGit()).path;
        const currentWorkspacePath = vscode.workspace.workspaceFolders?.[0].uri.path;

        if (currentWorkspacePath === undefined) {
            throw new Error("Cannot find current workspace path");
        }

        const githubToken: string | undefined = await getGithubToken();
        console.log("GitHubToken: ", githubToken);

        const fetchClusterNodes = async () => {
            const gitLog = await getGitLog(gitPath, currentWorkspacePath);
            const gitConfig = await getGitConfig(gitPath, currentWorkspacePath, "origin");
            const { owner, repo } = getRepo(gitConfig);
            const branchNames = await getBranchNames(gitPath, currentWorkspacePath);
            const baseBranchName = getBaseBranchName(branchNames);
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
        const initialData = await fetchClusterNodes();
        const webLoader = new WebviewLoader(extensionUri, extensionPath, initialData, fetchClusterNodes);

        subscriptions.push(webLoader);

        vscode.window.showInformationMessage("Hello Githru");
    });

    const getAccessToken = vscode.commands.registerCommand(COMMAND_GET_ACCESS_TOKEN, async () => {
        const config = vscode.workspace.getConfiguration()

        const defaultGithubToken = await getGithubToken();

        const newGithubToken = await vscode.window.showInputBox({
            title: "Type or paste your Github access token value.",
            placeHolder: "Type valid token here!",
            value: defaultGithubToken ?? ''
        });

        if (!newGithubToken) 
            throw new Error("Cannot get users' access token properly");

        config.update('githru.github.token',newGithubToken, vscode.ConfigurationTarget.Global);
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
