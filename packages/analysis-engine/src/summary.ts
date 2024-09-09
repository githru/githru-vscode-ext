import type PluginOctokit from "./pluginOctokit";
import type { CommitRaw, StemDict } from "./types";

const apiKey = process.env.GEMENI_API_KEY || '';
const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=";

export async function getSummary(csmNodes: CommitRaw[]) {
  const commitMessages = csmNodes.map((csmNode) => csmNode.message.split('\n')[0]).join(', ');

  try {
    const response = await fetch(apiUrl + apiKey, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{parts: [{text: `${prompt} \n${commitMessages}`}]}],
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

export async function getLatestCommitSummary(stemDict: StemDict, baseBranchName: string) {
  const nodes = stemDict.get(baseBranchName)?.nodes?.map(({commit}) => commit);

  return await getSummary(nodes ? nodes?.slice(-10) : [])
}

export async function getCurrentUserCommitSummary(stemDict: StemDict, baseBranchName: string, octokit: PluginOctokit) {
  const { data } = await octokit.rest.users.getAuthenticated();
  const currentUserNodes = stemDict.get(baseBranchName)?.nodes?.filter(({commit}) => commit.author.name === data.login || commit.author.name === data.name)?.map(({commit}) => commit);

  return await getSummary(currentUserNodes ? currentUserNodes?.slice(-10) : [])
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

Commits:`
