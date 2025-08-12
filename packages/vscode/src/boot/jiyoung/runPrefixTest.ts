import { LLMClient } from "./LLMClient";
import { getCommitPrefixStats } from "./prefixAnalyzer";

async function run() {
  const prefixStats = getCommitPrefixStats();

  const prompt = `
    I analyzed the Git commit message prefixes for the past month. Here is the prefix usage ranking:

      ${prefixStats}

    Please summarize the most common types of tasks and the project's direction.
  `;

  const client = new LLMClient();
  const result = await client.sendPrompt(prompt);

  console.log("📈 LLM analysis result:\n", result);
}

run();
