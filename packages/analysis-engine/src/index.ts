import "reflect-metadata";
import { container } from "tsyringe";
import { getCommitRaws } from "./parser";
import { PluginOctokit } from "./pluginOctokit";
import { buildCommitDict } from "./commit.util";
import { buildStemDict } from "./stem";
import { buildCSMDict } from "./csm";

type AnalysisEngineArgs = {
  isDebugMode?: boolean;
  gitLog: string;
  baseBranchName: string;
};

container.register("Options", {
  useValue: {
    owner: "githru",
    repo: "githru-vscode-ext",
    options: {
      auth: "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",
    },
  },
});

const octokit = container.resolve(PluginOctokit);

export const analyzeGit = async ({
  isDebugMode,
  gitLog,
  baseBranchName,
}: AnalysisEngineArgs) => {
  const pullRequests = await octokit.getPullRequests();
  pullRequests.forEach((pullRequest, index) => {
    console.log(
      `[${index}] merge commit hash - ${pullRequest.detail.data.merge_commit_sha}`
    );
    console.log(`[${index}] open | close - ${pullRequest.detail.data.state}`);
    console.log(`[${index}] additions - ${pullRequest.detail.data.additions}`);
    console.log(`[${index}] deletions - ${pullRequest.detail.data.deletions}`);
    console.log(
      `[${index}] changed_files - ${pullRequest.detail.data.changed_files}`
    );
    console.log(`[${index}] title - ${pullRequest.detail.data.title}`);
    console.log(`[${index}] body - ${pullRequest.detail.data.body}`);
    console.log(
      `[${index}] commits_url - ${pullRequest.detail.data.commits_url}`
    );
    pullRequest.commitDetails.data.forEach((commitDetail, commitIndex) => {
      console.log(
        `[${index} - ${commitIndex}] commitDetail.commit.author - ${commitDetail.commit.author}`
      );
      console.log(
        `[${index} - ${commitIndex}] commitDetail.commit.message - ${commitDetail.commit.message}`
      );
      console.log(
        `[${index} - ${commitIndex}] commitDetail.commit.tree.sha - ${commitDetail.commit.tree.sha}`
      );
      console.log(
        `[${index} - ${commitIndex}] commitDetail.commit.tree.url - ${commitDetail.commit.tree.url}`
      );
      console.log(
        `[${index} - ${commitIndex}] commitDetail.commit.url - ${commitDetail.commit.url}`
      );
      console.log(
        `[${index} - ${commitIndex}] commitDetail.url - ${commitDetail.url}`
      );
      console.log(
        `[${index} - ${commitIndex}] commitDetail.sha - ${commitDetail.sha}`
      );
    });
  });

  const commitRaws = getCommitRaws(gitLog);
  const commitDict = buildCommitDict(commitRaws);
  const stemDict = buildStemDict(commitDict, baseBranchName);
  const csmDict = buildCSMDict(commitDict, stemDict, baseBranchName);

  if (isDebugMode) {
    console.log(csmDict);
  }

  return csmDict;
};

export default analyzeGit;
