import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generateNewViz } from "../../tool/generateNewViz.js";
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
        locale: z.enum(["en", "ko"]).default("en").describe("Response language (en: English, ko: Korean)"),
        debug: z.boolean().default(false).describe("Enable debug mode for detailed logging"),
      },
    },

    async ({ repo, baseBranchName, locale, debug }: {
      repo: string;
      baseBranchName?: string;
      locale?: string;
      debug?: boolean;
    }) => {
      try {
        const config = Config.getInstance();
        const githubToken = config.getGithubToken();

        const result = await generateNewViz({
          repo,
          githubToken,
          baseBranchName,
          locale,
          debug
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