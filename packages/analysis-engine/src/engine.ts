import "reflect-metadata";

import { container } from "tsyringe";

import { buildCommitDict } from "./commit.util";
import { buildCSMDict } from "./csm";
import getCommitRaws from "./parser";
import { PluginOctokit } from "./pluginOctokit";
import { buildStemDict } from "./stem";
import { getSummary } from "./summary";
import type { CommitNode } from "./types";

export type AnalysisEngineArgs = {
  isDebugMode?: boolean;
  gitLog: string;
  owner: string;
  repo: string;
  baseBranchName: string;
  auth?: string;
};

export class AnalysisEngine {
  private static instance: AnalysisEngine | null = null;
  private gitLog!: string;
  private isDebugMode?: boolean;
  private octokit!: PluginOctokit;
  private baseBranchName!: string;
  private nodes?: CommitNode[];
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): AnalysisEngine {
    if (!AnalysisEngine.instance) {
      AnalysisEngine.instance = new AnalysisEngine();
    }
    return AnalysisEngine.instance;
  }

  public initialize(args: AnalysisEngineArgs): void {
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
    this.isInitialized = true;
  }

  private checkInitialization() {
    if (!this.isInitialized) {
      throw new Error("AnalysisEngine is not initialized. Call initialize() first.");
    }
  }

  public async analyzeGit() {
    this.checkInitialization();

    if (!this.gitLog) {
      throw new Error("AnalysisEngine is not initialized. Call initialize() first.");
    }

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
    this.nodes = stemDict.get(this.baseBranchName)?.nodes;

    return {
      isPRSuccess,
      csmDict,
    };
  }

  public updateArgs(args: AnalysisEngineArgs) {
    if (container.isRegistered("OctokitOptions")) container.clearInstances();
    this.initialize(args);
  }

  public async geminiCommitSummary() {
    this.checkInitialization();
    if (!this.nodes) {
      throw new Error("No commits available. Run analyzeGit() first.");
    }
    return await getSummary(this.nodes.slice(-10).map(({ commit }) => commit));
  }
}

export default AnalysisEngine;
