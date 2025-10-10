import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { I18n } from "../../common/i18n.js";
import type { ContributorRecommenderInputs } from "../../common/types.js";

export function registerContributorRecommenderTool(server: McpServer) {
    server.registerTool(
    "contributor_recommender",
    {
        title: "Code Contributor Recommender",
        description: "Recommends contributors who have contributed most to specific files/branches/PR areas by aggregating recent contribution data.",
        inputSchema: {
        repoPath: z.string().describe("GitHub repository path (e.g: owner/repo or https://github.com/owner/repo)"),
        pr: z.union([z.string(), z.number()]).optional().describe("PR-based recommendation (PR number)"),
        paths: z.array(z.string()).optional().describe("File/directory path array (supports glob patterns)"),
        branch: z.string().optional().describe("Branch-based recommendation (default: main)"),
        since: z.string().optional().describe("Analysis period start (default 90 days, 30d/ISO date etc.)"),
        until: z.string().optional().describe("Analysis period end (current if unspecified)"),
        githubToken: z.string().describe("GitHub authentication token"),
        locale: z.enum(["en", "ko"]).default("en").describe("Response language (en: English, ko: Korean)"),
        chart: z.boolean().default(false).describe("Generate interactive chart visualization (true: HTML chart display, false: JSON data)"),
        },
    },

    async ({ repoPath, pr, paths, branch, since, until, githubToken, locale, chart }: ContributorRecommenderInputs & { locale?: string; chart?: boolean }) => {
        try {
        I18n.setLocale(locale || 'en');
        
        const { ContributorRecommender } = await import('../../tool/contributorRecommender.js');
        const recommender = new ContributorRecommender({
            repoPath,
            pr,
            paths,
            branch,
            since,
            until,
            githubToken,
            locale,
        });
        
        const recommendation = await recommender.analyze();

        if (chart) {
            const chartHtml = recommender.generateChart(recommendation);
            return {
            content: [
                {
                type: "text",
                text: chartHtml,
                },
            ],
            };
        } else {
            return {
            content: [
                {
                type: "text",
                text: JSON.stringify(recommendation, null, 2),
                },
            ],
            };
        }
        } catch (err: any) {
        return {
            content: [
            { type: "text", text: `Contributor recommendation error occurred: ${err?.message ?? String(err)}` },
            ],
        };
        }
    }
  );
}