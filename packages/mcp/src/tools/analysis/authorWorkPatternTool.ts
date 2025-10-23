import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { I18n } from "../../common/i18n.js";
import { AuthorWorkPatternAnalyzer, AuthorWorkPatternArgs } from "../../core/authorWorkPattern.js";

export function registerAuthorWorkPatternTool(server: McpServer) {
  server.registerTool(
    "author_work_pattern",
    {
      title: "Author Work Pattern Analyzer",
      description:
        "Analyzes an author’s development activity within a given period to measure workload and commit patterns. Aggregates metrics such as commits, insertions, deletions, and churn, and classifies commit types to reveal focus areas.",
      inputSchema: {
        repoPath: z.string().describe("GitHub repository path (e.g: owner/repo or https://github.com/owner/repo)"),
        author: z.string().describe("Author identifier (login, name, or partial email)"),
        branch: z.string().optional().describe("Branch to analyze (default: main)"),
        since: z.string().optional().describe("Analysis period start"),
        until: z.string().optional().describe("Analysis period end (defaults to now if unspecified)"),
        githubToken: z.string().describe("GithubToken when use repository clone"),
        locale: z.enum(["en", "ko"]).default("en").describe("Response language (en: English, ko: Korean)"),
        chart: z.boolean().default(false).describe("Return HTML chart (true)"),
      },
    },

    async ({
      repoPath,
      author,
      branch,
      since,
      until,
      githubToken,
      locale,
      chart,
    }: AuthorWorkPatternArgs & { locale?: "en" | "ko"; chart?: boolean }) => {
      try {
        I18n.setLocale(locale || "en");

        const analyzer = new AuthorWorkPatternAnalyzer({
          repoPath,
          author,
          branch,
          since,
          until,
          githubToken,
          locale,
          chart,
        });

        const payload = await analyzer.analyze();

        if (chart) {
          return await analyzer.generateReport(payload);
        }

        return {
          content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
        };
      } catch (err: any) {
        return {
          content: [
            {
              type: "text",
              text: `${I18n.t("errors.author_work_analysis")} ${err?.message ?? String(err)}`,
            },
          ],
        };
      }
    }
  );
}
