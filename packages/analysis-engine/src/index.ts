import "reflect-metadata";

import { container } from "tsyringe";

import { buildCommitDict } from "./commit.util";
import { buildCSMDict, buildPaginatedCSMDict } from "./csm";
import getCommitRaws from "./parser";
import { PluginOctokit } from "./pluginOctokit";
import { buildStemDict } from "./stem";
import { getSummary } from "./summary";
import type { AnalyzeGitResult } from "./types";

export { buildPaginatedCSMDict } from "./csm";

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

  // Cached data
  private commitDict?: ReturnType<typeof buildCommitDict>;
  private pullRequests?: Awaited<ReturnType<PluginOctokit["getPullRequests"]>>;
  private stemDict?: ReturnType<typeof buildStemDict>;
  private isPRSuccess: boolean = true;

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

  public init = async () => {
    if (this.isDebugMode) console.log("baseBranchName: ", this.baseBranchName);

    const commitRaws = getCommitRaws(this.gitLog);
    if (this.isDebugMode) console.log("commitRaws: ", commitRaws);

    this.commitDict = buildCommitDict(commitRaws);
    if (this.isDebugMode) console.log("commitDict: ", this.commitDict);

    this.pullRequests = await this.octokit
      .getPullRequests()
      .catch((err) => {
        console.error(err);
        this.isPRSuccess = false;
        return [];
      })
      .then((pullRequests) => {
        console.log("success, pr = ", pullRequests);
        return pullRequests;
      });
    if (this.isDebugMode) console.log("pullRequests: ", this.pullRequests);

    this.stemDict = buildStemDict(this.commitDict, this.baseBranchName);
    if (this.isDebugMode) console.log("stemDict: ", this.stemDict);
  };

  public analyzeGit = async (
    perPage?: number,
    lastCommitId?: string
  ): Promise<AnalyzeGitResult> => {
    if (!this.commitDict || !this.stemDict || !this.pullRequests) {
      throw new Error("AnalysisEngine not initialized. Call init() first.");
    }

    // Paginated CSM
    if (perPage) {
      const csmDict = buildPaginatedCSMDict(
        this.commitDict,
        this.stemDict,
        this.baseBranchName,
        perPage,
        lastCommitId,
        this.pullRequests
      );
      const list = csmDict[this.baseBranchName] ?? [];
      const lastNode = list.length > 0 ? list[list.length - 1] : undefined;

      const isLastPage = list.length < perPage;
      const nextCommitId = !isLastPage && lastNode ? lastNode.base.commit.id : undefined;

      return {
        isPRSuccess: this.isPRSuccess,
        csmDict,
        nextCommitId,
        isLastPage,
      };
    } else {
      // Non-paginated CSM
      const csmDict = buildCSMDict(this.commitDict, this.stemDict, this.baseBranchName, this.pullRequests);
      if (this.isDebugMode) console.log("csmDict: ", csmDict);
      const nodes = this.stemDict.get(this.baseBranchName)?.nodes?.map(({ commit }) => commit);
      const geminiCommitSummary = await getSummary(nodes ? nodes?.slice(-10) : []);
      if (this.isDebugMode) console.log("GeminiCommitSummary: ", geminiCommitSummary);

      return {
        isPRSuccess: this.isPRSuccess,
        csmDict,
        nextCommitId: undefined,
        isLastPage: true,
      };
    }
  };

  public getBaseBranchName = () => {
    return this.baseBranchName;
  };

  public updateArgs = (args: AnalysisEngineArgs) => {
    if (container.isRegistered("OctokitOptions")) container.clearInstances();
    this.insertArgs(args);
    // Clear cached data
    this.commitDict = undefined;
    this.stemDict = undefined;
    this.pullRequests = undefined;
    this.isPRSuccess = true;
  };
}

export default AnalysisEngine;
