import { spawn } from "child_process";

let git = spawn("git", [
  "--no-pager",
  "log",
  "--all",
  "--parents",
  "--numstat",
  "--date-order",
  "--pretty=fuller",
  "-c",
]);

export function getGitLog(): Promise<string> {
  return new Promise((resolve, reject) => {
    let gitLog = "";

    git.stdout.on("data", (data) => {
      gitLog += data.toString();
    });

    git.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
      reject(data);
    });

    git.on("close", () => {
      resolve(gitLog);
    });
  });
}
