import { GitError } from "../errors/GitError";

export function formatGitError(
  status: { code: number; error: Error | null },
  stderr: string,
  command: string[]
): GitError {
  const { code, error } = status;

  const message = error
    ? `Failed to execute git command: ${error.message}`
    : `Git command failed with exit code ${code}`;

  return new GitError(message, command.join(" "), stderr, code);
}
