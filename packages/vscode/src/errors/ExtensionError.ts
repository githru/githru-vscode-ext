class WorkspacePathUndefinedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkspacePathUndefinedError";
  }
}

class GithubTokenUndefinedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GithubTokenUndefinedError";
  }
}

export { GithubTokenUndefinedError, WorkspacePathUndefinedError };
