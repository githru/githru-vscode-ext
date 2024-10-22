import * as cp from "child_process";
import { parentPort, workerData } from "worker_threads";

import { resolveSpawnOutput } from "./git.util";

const { gitPath, currentWorkspacePath, skipCount, limitCount } = workerData;

async function getPartialGitLog() {
  const gitLogFormat =
    "%n%n" +
    [
      "%H", // commit hash (id)
      "%P", // parent hashes
      "%D", // ref names (branches, tags)
      "%an", // author name
      "%ae", // author email
      "%ad", // author date
      "%cn", // committer name
      "%ce", // committer email
      "%cd", // committer date
      "%w(0,0,4)%s", // commit message subject
      "%b", // commit message body
    ].join("%n");

  const args = [
    "--no-pager",
    "log",
    "--all",
    "--parents",
    "--numstat",
    "--date-order",
    `--pretty=format:${gitLogFormat}`,
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
