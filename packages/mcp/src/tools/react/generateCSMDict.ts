import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generateNewViz } from "../../core/generateNewViz.js";
import { Config } from "../../common/config.js";

export function registerGenerateCsmDictTool(server: McpServer) {
  server.registerTool(
    "generate_csm_dict",
    {
      title: "Generate CSM Dictionary",
      description: "Generates CSM (Commit Sequence Map) Dictionary from GitHub repository using AnalysisEngine",
      inputSchema: {
        repo: z.string().describe("GitHub repository (format: 'owner/repo' or 'https://github.com/owner/repo')"),
        baseBranchName: z.string().optional().describe("Base branch name to analyze (default: repository's default branch)"),
        githubToken: z.string().describe("GithubToken when use repository clone"),
        locale: z.enum(["en", "ko"]).default("en").describe("Response language (en: English, ko: Korean)"),
      },
    },

    async ({ repo, baseBranchName, githubToken, locale }: {
      repo: string;
      baseBranchName?: string;
      githubToken: string
      locale?: string;
    }) => {
      try {
        /**
         * @TODO: Issue #1012
         * Remote MCP 서버에서 Github Token을 읽어들일 수가 없는 이슈로 인해 주석처리
         */
          // const config = Config.getInstance();
          // const githubToken = config.getGithubToken();

        const result = await generateNewViz({
          repo,
          githubToken,
          baseBranchName,
          locale,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [
            { type: "text", text: `CSM Dictionary generation error: ${err?.message ?? String(err)}` },
          ],
        };
      }
    }
  );
}