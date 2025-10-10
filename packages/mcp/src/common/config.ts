export class Config {
  private static instance: Config;

  public readonly githubToken: string;

  private constructor() {
    this.githubToken = process.env.GITHUB_TOKEN || '';
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  public getGithubToken(): string {
    if (!this.githubToken) {
      throw new Error("github token missing");
    }
    return this.githubToken;
  }
}