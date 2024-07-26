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

  private async createOctokit(session: vscode.AuthenticationSession) {
    return new Octokit.Octokit({
      auth: session.accessToken,
      request: {
        fetch: fetch,
      },
    });
  }

  private async setOctokit() {
    const session = await vscode.authentication.getSession(GITHUB_AUTH_PROVIDER_ID, SCOPES, { createIfNone: false });

    if (session) {
      this.octokit = await this.createOctokit(session);
    }

    this.octokit = undefined;
  }

  private registerListeners(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
      vscode.authentication.onDidChangeSessions(async (e) => {
        if (e.provider.id === GITHUB_AUTH_PROVIDER_ID) {
          await this.setOctokit();
        }
      })
    );
  }

  /** Octokit 인스턴스가 없다면, 인증 세션을 새로 만듦으로써, Octokit 인스턴스가 항상 존재하도록 보장한다. */
  private async ensureOctokitInstance(): Promise<void> {
    if (!this.octokit) {
      const session = await vscode.authentication.getSession(GITHUB_AUTH_PROVIDER_ID, SCOPES, { createIfNone: true });
      this.octokit = await this.createOctokit(session);
    }
  }

  async getOctokit(): Promise<Octokit.Octokit> {
    await this.ensureOctokitInstance();
    return this.octokit!;
  }

  async getAuth(): Promise<OctokitAuth> {
    await this.ensureOctokitInstance();
    return this.octokit!.auth() as Promise<OctokitAuth>;
  }
}
