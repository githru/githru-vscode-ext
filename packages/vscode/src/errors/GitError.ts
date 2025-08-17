import type { WorkerTask } from "../utils/gitParallel";

export class GitError extends Error {
  constructor(
    message: string,
    public readonly command?: string,
    public readonly stderr?: string,
    public readonly exitCode?: number
  ) {
    super(message);
    this.name = "GitError";
  }
}

export class WorkerThreadError extends GitError {
  constructor(
    message: string,
    public readonly workerData?: WorkerTask
  ) {
    super(message);
    this.name = "WorkerThreadError";
  }
}
