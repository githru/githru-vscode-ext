import * as Octokit from "@octokit/rest";
import fetch from "node-fetch";
import * as vscode from "vscode";

interface OctokitAuth {
  type: string;
  token: string;
  tokenType: string;
}

const GITHUB_AUTH_PROVIDER_ID = "github";
const SCOPES = ["user:email"];

export class Credentials {
  private octokit: Octokit.Octokit | undefined;

  async initialize(context: vscode.ExtensionContext): Promise<void> {
    this.registerListeners(context);
    this.setOctokit();
  }

  private async setOctokit() {
    const session = await vscode.authentication.getSession(GITHUB_AUTH_PROVIDER_ID, SCOPES, { createIfNone: false });

    if (session) {
      this.octokit = new Octokit.Octokit({
        auth: session.accessToken,
        request: {
          fetch: fetch,
        },
      });

      return;
    }

    this.octokit = undefined;
  }

  registerListeners(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
      vscode.authentication.onDidChangeSessions(async (e) => {
        if (e.provider.id === GITHUB_AUTH_PROVIDER_ID) {
          await this.setOctokit();
        }
      })
    );
  }

  async getOctokit(): Promise<Octokit.Octokit> {
    if (this.octokit) {
      return this.octokit;
    }

    const session = await vscode.authentication.getSession(GITHUB_AUTH_PROVIDER_ID, SCOPES, { createIfNone: true });
    this.octokit = new Octokit.Octokit({
      auth: session.accessToken,
      request: {
        fetch: fetch,
      },
    });

    return this.octokit;
  }

  async getAuth(): Promise<OctokitAuth> {
    if (this.octokit) {
      return this.octokit.auth() as Promise<OctokitAuth>;
    }

    const session = await vscode.authentication.getSession(GITHUB_AUTH_PROVIDER_ID, SCOPES, { createIfNone: true });
    this.octokit = new Octokit.Octokit({
      auth: session.accessToken,
      request: {
        fetch: fetch,
      },
    });

    return this.octokit.auth() as Promise<OctokitAuth>;
  }
}
