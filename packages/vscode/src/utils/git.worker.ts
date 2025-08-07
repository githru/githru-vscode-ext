import * as cp from "child_process";
import { parentPort, workerData } from "worker_threads";

import { GIT_LOG_FORMAT } from "./git.constants";
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

  resolveSpawnOutput(
    cp.spawn(gitPath, args, {
      cwd: currentWorkspacePath,
      env: Object.assign({}, process.env),
    })
  )
    .then(([status, stdout, stderr]) => {
      const { code, error } = status;

      if (code === 0 && !error && parentPort !== null) {
        parentPort.postMessage(stdout.toString());
      } else {
        if (parentPort !== null) parentPort.postMessage(stderr);
      }
    })
    .catch((error) => {
      console.error("Spawn Error:", error);
    });
}

getPartialGitLog();
