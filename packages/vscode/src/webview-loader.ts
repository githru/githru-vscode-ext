import * as vscode from "vscode";
import * as path from "path";

type WebviewContentData = {
    clusterNodes: string;
    commitGraphNodes: string;
};
export default class WebviewLoader implements vscode.Disposable {
    private readonly _panel: vscode.WebviewPanel | undefined;
    private fsPath: string;

    constructor(
        private readonly fileUri: vscode.Uri,
        private readonly extensionPath: string,
        data: WebviewContentData
    ) {
        const viewColumn = vscode.ViewColumn.One;
        this.fsPath = fileUri.fsPath;

        this._panel = vscode.window.createWebviewPanel("WebviewLoader", "githru-view", viewColumn, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.file(path.join(this.extensionPath, "dist"))],
        });

        this._panel.webview.onDidReceiveMessage((message: { command: string; payload: unknown }) =>
            this.respondToMessage(message)
        );

        this._panel.webview.html = this.getWebviewContent(data);
    }

    dispose() {
        this._panel?.dispose();
    }

    private async respondToMessage(message: { command: string; payload: unknown }) {
        if (message.command === "changeClusterOption") {
            this._panel?.webview.postMessage({
                command: message.command,
                // TODO v2: need to re-fetch git data on behalf of cluster option
                payload: {},
            });
        }
    }

    private getWebviewContent(data: WebviewContentData): string {
        const { clusterNodes, commitGraphNodes } = data;

        const reactAppPathOnDisk = vscode.Uri.file(path.join(this.extensionPath, "dist", "webviewApp.js"));
        const reactAppUri = reactAppPathOnDisk.with({ scheme: "vscode-resource" });

        const returnString = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="initial-scale=1.0">
                    <title>githru-vscode-ext webview</title>
                    <script>
                        window.isProduction = true;
                        window.githruData = ${clusterNodes};
                        window.commitGraphNodes = ${commitGraphNodes};
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
