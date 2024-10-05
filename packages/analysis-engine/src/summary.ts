import type PluginOctokit from "./pluginOctokit";
import {
  type CommitMessageType,
  CommitMessageTypeList,
  type CommitRaw,
  type DifferenceStatistic,
  type StemDict,
} from "./types";

const API_KEY = process.env.GEMENI_API_KEY || "";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=";
const MERGE_BRANCH = "Merge branch";
const MERGE_PULL_REQUEST = "Merge pull request";

async function getSummary(csmNodes: CommitRaw[]) {
  const commitMessages = csmNodes.map((csmNode) => csmNode.message.split("\n")[0]).join(", ");

  console.log("commitMessages: ", commitMessages);
  try {
    const response = await fetch(API_URL + API_KEY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${prompt} \n${commitMessages}` }] }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error("Error fetching summary:", error);
    return undefined;
  }
}

function isNonMergeCommit(message: string) {
  return !message.includes(MERGE_BRANCH) && !message.includes(MERGE_PULL_REQUEST);
}

export async function getLatestCommitSummary(stemDict: StemDict, baseBranchName: string) {
  const nodes = stemDict
    .get(baseBranchName)
    ?.nodes?.map(({ commit }) => commit)
    .filter(({ message }) => isNonMergeCommit(message));

  return await getSummary(nodes ? nodes?.slice(-10) : []);
}

export async function getCurrentUserCommitSummary(stemDict: StemDict, baseBranchName: string, octokit: PluginOctokit) {
  const { data } = await octokit.rest.users.getAuthenticated();
  const currentUserNodes = stemDict
    .get(baseBranchName)
    ?.nodes?.filter(
      ({ commit: { author, message } }) =>
        (author.name === data.login || author.name === data.name) && isNonMergeCommit(message)
    )
    ?.map(({ commit }) => commit);

  return await getSummary(currentUserNodes ? currentUserNodes?.slice(-10) : []);
}

function parseCommitMessageType(message: string): CommitMessageType {
  const firstLine = message.split("\n")[0].toLowerCase();
  for (const type of CommitMessageTypeList) {
    if (firstLine.startsWith(type + ":")) {
      return type;
    }
  }
  return "chore"; // Default type if no match found
}

async function getDiffCommits(
  octokit: PluginOctokit,
  owner: string,
  repo: string,
  baseBranch: string = "main",
  compareBranch: string = "HEAD"
): Promise<CommitRaw[]> {
  try {
    const response = await octokit.rest.repos.compareCommits({
      owner,
      repo,
      base: baseBranch,
      head: compareBranch,
    });

    return await Promise.all(
      response.data.commits.map(async (commit, index) => {
        const detailedCommit = await octokit.rest.repos.getCommit({
          owner,
          repo,
          ref: commit.sha,
        });

        const differenceStatistic: DifferenceStatistic = {
          totalInsertionCount: 0,
          totalDeletionCount: 0,
          fileDictionary: {},
        };

        detailedCommit.data.files?.forEach((file) => {
          differenceStatistic.totalInsertionCount += file.additions;
          differenceStatistic.totalDeletionCount += file.deletions;
          differenceStatistic.fileDictionary[file.filename] = {
            insertionCount: file.additions,
            deletionCount: file.deletions,
          };
        });

        return {
          sequence: index + 1,
          id: commit.sha,
          parents: commit.parents.map((parent) => parent.sha),
          branches: [], // GitHub API doesn't provide this information directly
          tags: [], // GitHub API doesn't provide this information directly
          author: {
            name: commit.commit.author?.name ?? "",
            email: commit.commit.author?.email ?? "",
          },
          authorDate: new Date(commit.commit.author?.date ?? ""),
          committer: {
            name: commit.commit.committer?.name ?? "",
            email: commit.commit.committer?.email ?? "",
          },
          committerDate: new Date(commit.commit.committer?.date ?? ""),
          message: commit.commit.message,
          differenceStatistic,
          commitMessageType: parseCommitMessageType(commit.commit.message),
        };
      })
    );
  } catch (error) {
    console.error("Error fetching commit differences:", (error as Error).message);
    return [];
  }
}

export async function getDiffSummary(
  octokit: PluginOctokit,
  owner: string,
  repo: string,
  baseBranch: string = "main",
  compareBranch: string = "HEAD"
) {
  const diffCommits = await getDiffCommits(octokit, owner, repo, baseBranch, compareBranch);

  return await getSummary(diffCommits);
}

const prompt = `Proceed with the task of summarising the contents of the commit message provided.

Procedure:
1. Separate the commits based on , .
2. Extract only the commits given, excluding the merge commits.
3. Summarise the commits based on the most common words. Keep the shape of your commit message.

Example Merge commits:
- Merge pull request #633 from HIITMEMARIO/main
- Merge branch ‘githru:main’ into main

Rules:
- Summarize in 3 to 5 lines.
- Combine similar or overlapping content. (e.g. feat: add button, feat: add button to header -> feat: add button)
- Include prefixes if present (e.g. feat, fix, refactor)
- Please preserve the stylistic style of the commit.

Output format:
‘’
- {prefix (if any)}:{Commit summary1}
- {prefix (if any)}:{Commit summary2}
- {prefix (if any)}:{commit summary3}
‘’

Commits:`;
