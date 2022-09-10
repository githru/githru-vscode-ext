import { spawn } from "child_process";

const git = spawn("git", [
  "--no-pager",
  "log",
  "--all",
  "--parents",
  "--numstat",
  "--date-order",
  "--pretty=fuller",
  "--decorate",
  "-c",
]);

export default function getGitLog(): Promise<string> {
  return new Promise((resolve, reject) => {
    let gitLog = "";

    git.stdout.on("data", (data) => {
      gitLog += data.toString();
    });

    git.stderr.on("error", (data) => {
      console.error(`stderr: ${data}`);
      reject(data);
    });

    git.on("close", () => {
      resolve(gitLog);
    });
  });
}
