import { analyzeGit } from "@githru-vscode-ext/analysis-engine";
import * as vscode from "vscode";
import { COMMAND_LAUNCH } from "./commands";
import { findGit, getGitLog } from "./utils/git.util";
import WebviewLoader from "./webview-loader";

let myStatusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
    const { subscriptions, extensionUri, extensionPath } = context;

    console.log('Congratulations, your extension "githru" is now active!');

    const disposable = vscode.commands.registerCommand(COMMAND_LAUNCH, async () => {
		const { path } = await findGit();
		const gitLog = await getGitLog(path, extensionPath);
        const csmDict = await analyzeGit({ isDebugMode: process.env.NODE_ENV !== 'production', gitLog });

		// TODO: run mapper function csm dictionary into the structure for view
		// below treatments soon be deleted
		const data = JSON.stringify(csmDict);

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
