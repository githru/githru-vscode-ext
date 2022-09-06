import { getStringifiedMockData } from "@githru-vscode-ext/analysis-engine";
import * as vscode from "vscode";
import { COMMAND_LAUNCH } from "./commands";
import WebviewLoader from "./webview-loader";


let myStatusBarItem: vscode.StatusBarItem;


export function activate(context: vscode.ExtensionContext) {
    const { subscriptions } = context; 

    console.log('Congratulations, your extension "githru" is now active!');

    const disposable = vscode.commands.registerCommand(COMMAND_LAUNCH, async () => {
        const data = await getStringifiedMockData("initialState");

        new WebviewLoader(context.extensionUri, context.extensionPath, data);

        vscode.window.showInformationMessage("Hello Githru");
    });
    subscriptions.push(disposable);

    myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    myStatusBarItem.text = "githru";
    myStatusBarItem.command = COMMAND_LAUNCH;
    subscriptions.push(myStatusBarItem);

    // update status bar item once at start
    myStatusBarItem.show();
}


// this method is called when your extension is deactivated
export function deactivate() {}
