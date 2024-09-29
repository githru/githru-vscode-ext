import AnalysisEngine from "@githru-vscode-ext/analysis-engine";
import type * as vscode from "vscode";

export class SidebarProvider implements vscode.WebviewViewProvider {
  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      const result = await this.callApi(data.apiNumber);
      webviewView.webview.postMessage({ type: "apiResult", result });
    });
  }

  private async callApi(apiNumber: number): Promise<string> {
    const engine = AnalysisEngine.getInstance();
    try {
      const summary = await engine.geminiCommitSummary();
      console.log("Commit summary:", summary);
    } catch (error) {
      console.error("Error getting commit summary:", error);
    }
    return `API ${apiNumber} 호출 결과`;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>API Caller</title>
            </head>
            <body>
                <button onclick="callApi(1)">API 1</button>
                <button onclick="callApi(2)">API 2</button>
                <button onclick="callApi(3)">API 3</button>
                <div id="result"></div>

                <script>
                    const vscode = acquireVsCodeApi();

                    function callApi(apiNumber) {
                        vscode.postMessage({ type: 'apiCall', apiNumber });
                    }

                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.type) {
                            case 'apiResult':
                                document.getElementById('result').innerText = message.result;
                                break;
                        }
                    });
                </script>
            </body>
            </html>
        `;
  }
}
