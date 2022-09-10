import { getCommitRaws, getGitLog } from "./parser";
import { buildCommitDict } from "./commit.util";
import { buildStemDict } from "./stem";
// TODO: import { buildCSMDict } from "./csm"

type AnalysisEngineOption = {
  isDebugMode: boolean;
};

export const analyzeGit = async (option?: AnalysisEngineOption) => {
  const gitLog = await getGitLog();
  const commitRaws = await getCommitRaws(gitLog);
  const commitDict = buildCommitDict(commitRaws);
  const stemDict = buildStemDict(commitDict);
  // const csmDict = buildCSM(commitDict, stemDict);

  // return csmDict;

  if (option?.isDebugMode) {
    console.log(stemDict);
  }

  return stemDict;
};

export default analyzeGit;
