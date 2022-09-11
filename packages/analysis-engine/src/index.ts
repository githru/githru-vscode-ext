import { getCommitRaws } from "./parser";
import { buildCommitDict } from "./commit.util";
import { buildStemDict } from "./stem";
import { buildCSMDict } from "./csm";

type AnalysisEngineArgs = {
  isDebugMode?: boolean;
  gitLog: string;
};

export const analyzeGit = async (args: AnalysisEngineArgs) => {
  const commitRaws = await getCommitRaws(args.gitLog);
  const commitDict = buildCommitDict(commitRaws);
  const stemDict = buildStemDict(commitDict);
  const csmDict = buildCSMDict(commitDict, stemDict);

  if (args.isDebugMode) {
    console.log(csmDict);
  }

  return csmDict;
};

export default analyzeGit;
