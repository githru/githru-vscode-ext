import "reflect-metadata";

import PluginOctokit from "./pluginOctokit.js";
import getCommitRaws from "../common/parser.js";
import { buildCommitDict } from "./commit.js";
import { buildStemDict } from "./stem.js";
import { buildCSMDict } from "./csm.js";
import { getSummary } from "../common/summary.js";

type AnalysisEngineArgs = {
  isDebugMode?: boolean;
  gitLog: string;
  owner: string;
  repo: string;
  baseBranchName: string;
  auth?: string;
};

export class AnalysisEngine {
  private gitLog!: string;

  private isDebugMode?: boolean;

  private octokit!: PluginOctokit;

  private baseBranchName!: string;

  constructor(args: AnalysisEngineArgs) {
    this.insertArgs(args);
  }

  private insertArgs = (args: AnalysisEngineArgs) => {
    const { isDebugMode, gitLog, owner, repo, auth, baseBranchName } = args;
    this.gitLog = gitLog;
    this.baseBranchName = baseBranchName;
    this.isDebugMode = isDebugMode;
    this.octokit = new PluginOctokit({
      owner,
      repo,
      options: {
        auth,
      },
    });
  };

  public analyzeGit = async () => {
    let isPRSuccess = true;

    const commitRaws = getCommitRaws(this.gitLog);

    const commitDict = buildCommitDict(commitRaws);

    const pullRequests = await this.octokit
      .getPullRequests()
      .catch((err) => {
        console.error(err);
        isPRSuccess = false;
        return [];
      })
      .then((pullRequests) => {
        return pullRequests;
      });

    const stemDict = buildStemDict(commitDict, this.baseBranchName);
    const csmDict = buildCSMDict(commitDict, stemDict, this.baseBranchName, pullRequests);
    const nodes = stemDict.get(this.baseBranchName)?.nodes?.map(({ commit }) => commit);
    const geminiCommitSummary = await getSummary(nodes ? nodes?.slice(-10) : []);

    return {
      isPRSuccess,
      csmDict,
    };
  }
}