import type { CommitRaw } from "./NodeTypes.temp";

export default class GitLog {
  collect(repoPath: string): string {
    // ...

    console.log(repoPath);

    return "";
  }

  parse(gitLogOutput: string): CommitRaw[] {
    // ...

    console.log(gitLogOutput);

    return [];
  }
}
