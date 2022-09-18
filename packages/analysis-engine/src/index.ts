import { getCommitRaws } from "./parser";
import { buildCommitDict } from "./commit.util";
import { buildStemDict } from "./stem";
import { buildCSMDict } from "./csm";

type AnalysisEngineArgs = {
  isDebugMode?: boolean;
  gitLog: string;
};

export const analyzeGit = async (args: AnalysisEngineArgs) => {
  const mainBranchName = "main";

  const commitRaws = getCommitRaws(args.gitLog);
  const commitDict = buildCommitDict(commitRaws);
  const stemDict = buildStemDict(commitDict, mainBranchName);
  const csmDict = buildCSMDict(commitDict, stemDict, mainBranchName);

  if (args.isDebugMode) {
    console.log(csmDict);
  }

  return csmDict;
};

export default analyzeGit;
