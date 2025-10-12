import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { I18n } from "../../common/i18n.js";
import type { FeatureImpactAnalyzerInputs } from "../../common/types.js";

export function registerFeatureImpactTool(server: McpServer) {
  server.registerTool(
    "feature_impact_analyzer",
    {
        title: "Feature Integration Impact Analyzer",
        description: `
        Takes a GitHub repository URL, Pull Request number, and authentication token as input.
        Analyzes the PR’s commits and changed files to compute impact metrics — scale, dispersion,
        chaos, isolation, lag, and coupling — and outputs a detailed HTML report highlighting
        long-tail file path outliers.
        `.trim(),
        inputSchema: {
        repoUrl: z.string().url().describe("Full URL of GitHub repository to analyze (e.g. https://github.com/owner/repo)"),
        prNumber: z.number().int().positive().describe("Pull Request number to analyze"),
        locale: z.enum(["en", "ko"]).default("en").describe("Response language (en: English, ko: Korean)"),
        isChart: z.boolean().default(false).describe("Return HTML chart (true) or JSON (false, default)"),
        },
    },

    async ({ repoUrl, prNumber, locale, isChart }: FeatureImpactAnalyzerInputs & { locale?: string; isChart?: boolean }) => {
        try {
        I18n.setLocale(locale || 'en');
        
        const { McpReportGenerator } = await import("../../core/featureImpactAnalyzer.js");
        const analyzeFeatureImpact = new McpReportGenerator({ repoUrl, prNumber, locale });

        const payload = await analyzeFeatureImpact.generateWithOutlierRatings();
        
        if (isChart) {
            const chartHtml = analyzeFeatureImpact.generateReport(payload);
            return {
            content: [
                {
                type: "text",
                text: JSON.stringify(payload, null, 2) + "\n created chart:" + chartHtml
                },
            ],
            };
        } else {
            return {
            content: [
                {
                type: "text",
                text: JSON.stringify(payload, null, 2),
                },
            ],
            };
        }
        } catch (err: any) {
        return {
            content: [
            { type: "text", text: `Analysis error occurred: ${err?.message ?? String(err)}` },
            ],
        };
        }
    }
);
}