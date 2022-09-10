import { getCommitRaws } from "./parser";
import { buildCommitDict } from "./commit.util";
import { buildStemDict } from "./stem";

type AnalysisEngineArgs = {
  isDebugMode: boolean;
  gitLog: string;
};

export const analyzeGit = async (args: AnalysisEngineArgs) => {
  const commitRaws = await getCommitRaws(args.gitLog);
  const commitDict = buildCommitDict(commitRaws);
  const stemDict = buildStemDict(commitDict);
  // const csmDict = buildCSM(commitDict, stemDict);
  // return csmDict;

  if (args.isDebugMode) {
    console.log(stemDict);
  }

  return stemDict;
};

export default analyzeGit;
