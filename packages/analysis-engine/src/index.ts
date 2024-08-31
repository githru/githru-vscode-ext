import "reflect-metadata";

import { container } from "tsyringe";

import { buildCommitDict } from "./commit.util";
import { buildCSMDict } from "./csm";
import getCommitRaws from "./parser";
import { PluginOctokit } from "./pluginOctokit";
import { buildStemDict } from "./stem";
import { getSummary } from "./summary";

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
    container.register("OctokitOptions", {
      useValue: {
        owner,
        repo,
        options: {
          auth,
        },
      },
    });
    this.octokit = container.resolve(PluginOctokit);
  };

  public analyzeGit = async () => {
    let isPRSuccess = true;
    if (this.isDebugMode) console.log("baseBranchName: ", this.baseBranchName);

    const commitRaws = getCommitRaws(this.gitLog);
    if (this.isDebugMode) console.log("commitRaws: ", commitRaws);

    const commitDict = buildCommitDict(commitRaws);
    if (this.isDebugMode) console.log("commitDict: ", commitDict);

    const pullRequests = await this.octokit
      .getPullRequests()
      .catch((err) => {
        console.error(err);
        isPRSuccess = false;
        return [];
      })
      .then((pullRequests) => {
        console.log("success, pr = ", pullRequests);
        return pullRequests;
      });
    if (this.isDebugMode) console.log("pullRequests: ", pullRequests);

    const stemDict = buildStemDict(commitDict, this.baseBranchName);
    if (this.isDebugMode) console.log("stemDict: ", stemDict);
    const csmDict = buildCSMDict(commitDict, stemDict, this.baseBranchName, pullRequests);
    if (this.isDebugMode) console.log("csmDict: ", csmDict);
    const nodes = stemDict.get(this.baseBranchName)?.nodes?.map(({commit}) => commit);
    const geminiCommitSummary = await getSummary(nodes ? nodes?.slice(-10) : []);
    if (this.isDebugMode) console.log("GeminiCommitSummary: ", geminiCommitSummary);

    return {
      isPRSuccess,
      csmDict,
    };
  };

  public updateArgs = (args: AnalysisEngineArgs) => {
    if (container.isRegistered("OctokitOptions")) container.clearInstances();
    this.insertArgs(args);
  };
}

export default AnalysisEngine;
