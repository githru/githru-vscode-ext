import * as vscode from "vscode";
import * as path from "path";

export default class WebviewLoader implements vscode.Disposable {
    private readonly _panel: vscode.WebviewPanel | undefined;
    private fsPath: string;

    constructor(
        private readonly fileUri: vscode.Uri,
        private readonly extensionPath: string,
        parseCommit: () => Promise<string>,
        getAllBranches: () => string,
    ) {
        const viewColumn = vscode.ViewColumn.One;
        this.fsPath = fileUri.fsPath;

        this._panel = vscode.window.createWebviewPanel("WebviewLoader", "githru-view", viewColumn, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.file(path.join(this.extensionPath, "dist"))],
        });

        this._panel.webview.onDidReceiveMessage(async (message: { command: string; payload: unknown }) => {
            switch (message.command) {
                case "refresh":
                case "fetchAnalyzedData":
                    const data = await parseCommit();
                    const resMessage = {...message, payload: data};
                    await this.respondToMessage(resMessage);
                    break;
                case "getBranchList":
                    const branches = getAllBranches();
                    await this.respondToMessage({
                        ...message,
                        payload: branches
                    })
                default:
                    console.log("Unknown Message");
            }
        });

        this._panel.webview.html = this.getWebviewContent(this._panel.webview);
    }

    dispose() {
        this._panel?.dispose();
    }

    private async respondToMessage(message: { command: string; payload: unknown }) {
        this._panel?.webview.postMessage({
            command: message.command,
            // TODO v2: need to re-fetch git data on behalf of cluster option
            payload: message.payload,
        });
    }

    private getWebviewContent(webview: vscode.Webview): string {
        const reactAppPathOnDisk = vscode.Uri.file(path.join(this.extensionPath, "dist", "webviewApp.js"));
        const reactAppUri = webview.asWebviewUri(reactAppPathOnDisk);
        // const reactAppUri = reactAppPathOnDisk.with({ scheme: "vscode-resource" });

        const returnString = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="initial-scale=1.0">
                    <title>githru-vscode-ext webview</title>
                    <script>
                        window.isProduction = true;
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
