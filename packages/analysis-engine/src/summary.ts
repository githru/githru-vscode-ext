import type { CommitNode, CommitPrompt, CSMDictionary, CSMNode } from "./types";

const apiKey = "";
const apiUrl = "https://api.openai.com/v1/completions";

function createPromptCommit(commitNode: CommitNode): CommitPrompt {
  const { sequence, id, author, committer, message, differenceStatistic, commitMessageType } = commitNode.commit;
  return {
    sequence,
    index: id,
    author,
    committer,
    message,
    differenceStatistic,
    commitMessageType,
  };
}

function changeToPromptSource(csmNode: CSMNode) {
  const baseCommit = createPromptCommit(csmNode.base);

  const sourceCommits = csmNode.source.map((source) => createPromptCommit(source));

  return [baseCommit, ...sourceCommits];
}

export async function getSummary(csmDict: CSMDictionary) {
  const test: CommitPrompt[][] = [];
  csmDict.main.forEach((csmNode) => {
    const commitStrings = changeToPromptSource(csmNode);
    test.push([...commitStrings]);
  });

  const commitContents: string[] = [];

  // 요약을 원하는 CSM i로 선택
  for (let i = 25; i < 28 && i < test.length; i++) {
    commitContents.push(JSON.stringify(test[i]));
  }

  const commitContentsString = commitContents.join("\n");
  console.log(commitContentsString);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-instruct",
        prompt: `다음 내용을 요약해줘, 주로 어떤 사람이 어떤 작업을 했는지 그리고 어떤 파일이 수정되었는지에 대한 내용 정확한 파일명을 넣어서 설명해야해\n ${commitContentsString}`,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const summary = data.choices[0].text.trim();
    console.log("Summary:", summary);
  } catch (error) {
    console.error("Error fetching summary:", error);
  }
}
