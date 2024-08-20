import * as cp from "child_process";
import * as fs from "fs";
import * as path from "path";

export interface GitExecutable {
  readonly path: string;
  readonly version: string;
}

export function resolveSpawnOutput(cmd: cp.ChildProcess) {
  return Promise.all([
    new Promise<{ code: number; error: Error | null }>((resolve) => {
      // status promise
      let resolved = false;
      cmd.on("error", (error) => {
        if (resolved) return;
        resolve({ code: -1, error: error });
        resolved = true;
      });
      cmd.on("exit", (code) => {
        if (resolved) return;
        resolve({ code: code || 0, error: null });
        resolved = true;
      });
    }),
    new Promise<Buffer>((resolve) => {
      // stdout promise
      const buffers: Buffer[] = [];
      cmd.stdout &&
        cmd.stdout.on("data", (b: Buffer) => {
          buffers.push(b);
        });
      cmd.stdout && cmd.stdout.on("close", () => resolve(Buffer.concat(buffers)));
    }),
    new Promise<string>((resolve) => {
      // stderr promise
      let stderr = "";
      cmd.stderr &&
        cmd.stderr.on("data", (d) => {
          stderr += d;
        });
      cmd.stderr && cmd.stderr.on("close", () => resolve(stderr));
    }),
  ]);
}

export async function findGit() {
  switch (process.platform) {
    case "darwin":
      return findGitOnDarwin();
    case "win32":
      return findGitOnWin32();
    default:
      return getGitExecutable("git");
  }
}

function findGitOnDarwin() {
  return new Promise<GitExecutable>((resolve, reject) => {
    cp.exec("which git", (err, stdout) => {
      if (err) return reject();

      const path = stdout.trim();
      if (path !== "/usr/bin/git") {
        getGitExecutable(path).then(
          (exec) => resolve(exec),
          () => reject()
        );
      } else {
        // must check if XCode is installed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cp.exec("xcode-select -p", (err: any) => {
          if (err && err.code === 2) {
            // git is not installed, and launching /usr/bin/git will prompt the user to install it
            reject();
          } else {
            getGitExecutable(path).then(
              (exec) => resolve(exec),
              () => reject()
            );
          }
        });
      }
    });
  });
}

function findGitOnWin32() {
  return (
    findSystemGitWin32(process.env["ProgramW6432"])
      .then(undefined, () => findSystemGitWin32(process.env["ProgramFiles(x86)"]))
      .then(undefined, () => findSystemGitWin32(process.env["ProgramFiles"]))
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .then(undefined, () =>
        findSystemGitWin32(
          process.env["LocalAppData"] ? path.join(process.env["LocalAppData"]!, "Programs") : undefined
        )
      )
      .then(undefined, () => findGitWin32InPath())
  );
}
function findSystemGitWin32(pathBase?: string) {
  return pathBase ? getGitExecutable(path.join(pathBase, "Git", "cmd", "git.exe")) : Promise.reject<GitExecutable>();
}
async function findGitWin32InPath() {
  const dirs = (process.env["PATH"] || "").split(";");
  dirs.unshift(process.cwd());

  for (let i = 0; i < dirs.length; i++) {
    const file = path.join(dirs[i], "git.exe");
    if (await isExecutable(file)) {
      try {
        return await getGitExecutable(file);
      } catch (_) {}
    }
  }
  return Promise.reject<GitExecutable>();
}

function isExecutable(path: string) {
  return new Promise<boolean>((resolve) => {
    fs.stat(path, (err, stat) => {
      resolve(!err && (stat.isFile() || stat.isSymbolicLink()));
    });
  });
}

export function getGitExecutable(path: string) {
  return new Promise<GitExecutable>((resolve, reject) => {
    resolveSpawnOutput(cp.spawn(path, ["--version"])).then((values) => {
      if (values[0].code === 0) {
        resolve({
          path: path,
          version: values[1]
            .toString()
            .trim()
            .replace(/^git version /, ""),
        });
      } else {
        reject();
      }
    });
  });
}

export async function getGitExecutableFromPaths(paths: string[]): Promise<GitExecutable> {
  for (let i = 0; i < paths.length; i++) {
    try {
      return await getGitExecutable(paths[i]);
    } catch (_) {}
  }
  throw new Error("None of the provided paths are a Git executable");
}

export async function getGitLog(
  gitPath: string,
  currentWorkspacePath: string
  // TODO
  // gitLogCountOffset: number,
  // gitLogCountLimit: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [
      "--no-pager",
      "log",
      "--all",
      "--parents",
      "--numstat",
      "--date-order",
      "--pretty=fuller",
      "--decorate",
      "-c",
    ];

    // TODO
    // console.log("getGitLog", { gitLogCountOffset, gitLogCountLimit });
    // if (gitLogCountOffset) args.push(`--skip=${gitLogCountOffset}`);
    // if (gitLogCountLimit) args.push(`-n ${gitLogCountLimit}`);

    resolveSpawnOutput(
      cp.spawn(gitPath, args, {
        cwd: currentWorkspacePath,
        env: Object.assign({}, process.env),
      })
    ).then((values) => {
      const [status, stdout, stderr] = values;
      if (status.code === 0) {
        resolve(stdout.toString());
      } else {
        reject(stderr);
      }
    });
  });
}

export async function getGitConfig(
  gitPath: string,
  currentWorkspacePath: string,
  remoteType: "origin" | "upstream"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = ["config", "--get", `remote.${remoteType}.url`];

    resolveSpawnOutput(
      cp.spawn(gitPath, args, {
        cwd: currentWorkspacePath,
        env: Object.assign({}, process.env),
      })
    ).then((values) => {
      const [status, stdout, stderr] = values;
      if (status.code === 0) {
        resolve(stdout.toString());
      } else {
        reject(stderr);
      }
    });
  });
}

export const getRepo = (gitRemoteConfig: string) => {
  const gitRemoteConfigPattern =
    /(?:https?|git)(?::\/\/(?:\w+@)?|@)(?:github\.com)(?:\/|:)(?:(?<owner>[^/]+?)\/(?<repo>[^/.]+))(?:\.git|\/)?(\S*)$/m;
  const gitRemote = gitRemoteConfig.match(gitRemoteConfigPattern)?.groups;
  if (!gitRemote) {
    throw new Error("git remote config should be: [https?://|git@]${domain}/${owner}/${repo}.git");
  }

  const { owner, repo } = gitRemote;
  if (!owner || !repo) {
    throw new Error("no owner/repo");
  }

  return { owner, repo };
};

export async function getBranches(
  path: string,
  repo: string
): Promise<{
  branchList: string[];
  head: string | null;
}> {
  let head = null;
  const branchList = [];

  const [status, stdout, stderr] = await resolveSpawnOutput(
    cp.spawn(path, ["branch", "-a"], {
      cwd: repo,
      env: Object.assign({}, process.env),
    })
  );

  if (status.code !== 0) throw stderr;

  const branches = stdout.toString().split(/\r\n|\r|\n/g);
  for (let branch of branches) {
    branch = branch
      .trim()
      .replace(/(.*) -> (?:.*)/g, "$1")
      .replace("remotes/", "");
    if (branch.startsWith("* ")) {
      if (branch.includes("HEAD detached")) continue;
      branch = branch.replace("* ", "");
      head = branch;
    }
    branchList.push(branch);
  }

  if (!head) head = getDefaultBranchName(branchList);

  return { branchList, head };
}

export function getDefaultBranchName(branchList: string[]): string {
  const branchSet = new Set(branchList);
  return branchSet.has("main") ? "main" : branchSet.has("master") ? "master" : branchList?.[0];
}

export async function getCurrentBranchName(path: string, repo: string): Promise<string> {
  const [status, stdout, stderr] = await resolveSpawnOutput(
    cp.spawn(path, ["branch", "--show-current"], {
      cwd: repo,
      env: Object.assign({}, process.env),
    })
  );

  if (status.code !== 0) throw stderr;
  return stdout.toString().trim();
}
