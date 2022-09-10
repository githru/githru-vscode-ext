import * as vscode from "vscode";
import * as path from "path";
export default class WebviewLoader {
    private readonly _panel: vscode.WebviewPanel | undefined;
    private fileName: string;
    private fsPath: string;

    constructor(private readonly fileUri: vscode.Uri, private readonly extensionPath: string, data: string) {
        const viewColumn = vscode.ViewColumn.One;

        this.fsPath = fileUri.fsPath;
        this.fileName = path.basename(this.fsPath);

        this._panel = vscode.window.createWebviewPanel("WebviewLoader", "webview", viewColumn, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.file(path.join(this.extensionPath, "dist"))],
        });

        this._panel.webview.onDidReceiveMessage((message: { command: string; payload: unknown }) =>
            this.respondToMessage(message)
        );

        this._panel.webview.html = this.getWebviewContent(data);
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

    private getWebviewContent(data: string): string {
        const reactAppPathOnDisk = vscode.Uri.file(path.join(this.extensionPath, "dist", "webviewApp.js"));
        const reactAppUri = reactAppPathOnDisk.with({ scheme: "vscode-resource" });

        const returnString = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="initial-scale=1.0">
                    <title>githru-vscode-ext webview</title>
                    <meta http-equiv="Content-Security-Policy" 
                        content="default-src 'none';
                            img-src https:;
                            script-src 'unsafe-eval' 'unsafe-inline' vscode-resource:;
                            style-src vscode-resource: 'unsafe-inline';">
                    <script>
                        window.githruData = ${data};
                    </script>
                </head>
                <body>
                    <div id="root" style="position: absolute;width: 100%; height: 100%; overflow: auto; margin-left:80px; left: -80px;">
                    <script src="${reactAppUri}"></script>
                    <script>
                        var vscode = acquireVsCodeApi();
                    </script>
                </body>
            </html>
        `;
        return returnString;
    }
}