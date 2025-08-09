import * as cp from "child_process";
import { parentPort, workerData } from "worker_threads";

import { GIT_LOG_FORMAT } from "./git.constants";
import { formatGitError } from "./git.error-handler";
import { resolveSpawnOutput } from "./git.util";

const { gitPath, currentWorkspacePath, skipCount, limitCount } = workerData;

async function getPartialGitLog() {
  const args = [
    "--no-pager",
    "log",
    "--all",
    "--parents",
    "--numstat",
    "--date-order",
    `--pretty=format:${GIT_LOG_FORMAT}`,
    "--decorate",
    "-c",
    `--skip=${skipCount}`,
    `-n ${limitCount}`,
  ];

  try {
    if (parentPort === null) return;

    const [status, stdout, stderr] = await resolveSpawnOutput(
      cp.spawn(gitPath, args, {
        cwd: currentWorkspacePath,
        env: Object.assign({}, process.env),
      })
    );

    if (status.code === 0 && !status.error) {
      parentPort.postMessage(stdout.toString());
    } else {
      const gitError = formatGitError(status, stderr, [gitPath, ...args]);
      parentPort.postMessage(gitError.message);
    }
  } catch (error) {
    console.error("Spawn Error:", error);
  }
}

getPartialGitLog();
