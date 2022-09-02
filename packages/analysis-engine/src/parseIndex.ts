import { getGitLog } from "./parseSpawn";
import { parseToJSON } from "./parseLog";

export function logParse() {
  getGitLog().then((value) => parseToJSON(value));
}

logParse();
