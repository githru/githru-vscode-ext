import { getStringifiedMockData } from "@githru-vscode-ext/analysis-engine";
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
        if (message.command === "fetchMockData") {
            const fetchState = await getStringifiedMockData("fetchState");
            this._panel?.webview.postMessage({
                command: message.command,
                payload: fetchState,
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
                    <div id="mock1">
                        <span>githruData</span>
                    </div>
                    <script>
                        document.getElementById("mock1").innerHTML = "<span>githruData1: " + window.githruData + "</span>";
                    </script>
                    <div id="mock2">
                        <span>githruData.dictionary["third"].parentIds[1]</span>
                    </div>
                    <script>
                        document.getElementById("mock2").innerHTML = "githruData2: " + window.githruData.dictionary["third"].parentIds[1] + "</span>";
                    </script>
                    <div>
                        <input id="mockButton" type="button" value="button">
                    </div>
                    <div id="root" style="position: absolute;width: 100%; height: 100%; overflow: auto; margin-left:80px; left: -80px;">
                    <script src="${reactAppUri}"></script>
                    <script>
                        var vscode = acquireVsCodeApi();
                        document.getElementById("mockButton").addEventListener('click', function(){ vscode.postMessage({ command: 'fetchMockData' }); });
                    </script>
                </body>
            </html>
        `;
        return returnString;
    }
}
