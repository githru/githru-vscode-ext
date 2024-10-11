import * as cp from 'child_process';
import { parentPort, workerData } from 'worker_threads';

import { resolveSpawnOutput } from './git.util'

const { gitPath, currentWorkspacePath, skipCount, limitCount,COMMIT_SEPARATOR,GIT_LOG_SEPARATOR } = workerData;

    


async function getPartialGitLog() {
    const gitLogFormat =
      COMMIT_SEPARATOR +
      [
        "%H", // commit hash (id)
        "%P", // parent hashes
        "%D", // ref names (branches, tags)
        "%an", // author name
        "%ae", // author email
        "%ad", // author date
        "%cn",
        "%ce",
        "%cd", // committer name, committer email and committer date
        "%B", // commit message  (subject and body)
      ].join(GIT_LOG_SEPARATOR) +
      GIT_LOG_SEPARATOR;

    const args = [
        '--no-pager',
        'log',
        '--all',
        '--parents',
        '--numstat',
        '--date-order',
        `--pretty=format:${gitLogFormat}`,
        '--decorate',
        '-c',
        `--skip=${skipCount}`,
        `-n ${limitCount}`,
    ];

    resolveSpawnOutput(
        cp.spawn(gitPath, args, {
            cwd: currentWorkspacePath,
            env: Object.assign({}, process.env),
        })
        ).then(([status, stdout, stderr]) => {
        const { code, error } = status;

        if (code === 0 && !error && parentPort !== null) {
            parentPort.postMessage(stdout.toString());
        } else {
            if (parentPort !== null) parentPort.postMessage(stderr);
        }
        }).catch(error => {
            console.error('Spawn Error:', error);
        });
}

getPartialGitLog();