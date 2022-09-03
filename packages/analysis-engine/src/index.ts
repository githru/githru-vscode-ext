import { getGitLog } from "./parseSpawn";
import { parseToJSON } from "./parseLog";

(async function () {
  const value = await getGitLog();
  parseToJSON(value);
})();
