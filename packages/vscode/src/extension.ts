// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { getStringifiedMockData } from "@githru-vscode-ext/analysis-engine";
import * as vscode from "vscode";
import WebviewLoader from "./webview-loader";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "vscode" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "githru.command.open.webview",
    async () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user

      const data = await getStringifiedMockData("initialState");

      new WebviewLoader(context.extensionUri, context.extensionPath, data);

      vscode.window.showInformationMessage("Hello Githru");
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
