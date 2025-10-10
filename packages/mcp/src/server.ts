import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { testReactComponents } from "./tool/reactComponentTester.js";
import { testDataDrivenComponents } from "./tool/dataDrivenComponentTester.js";
import { renderStorylineUI } from "./tool/storylineRenderer.js";
import type { FeatureImpactAnalyzerInputs, ContributorRecommenderInputs, ReactComponentTestInputs, DataDrivenComponentInputs } from "./common/types.js";
import { I18n } from "./common/i18n.js";
import { generateNewViz } from "./tool/generateNewViz.js";
import { registerTestTools } from "./tools/test/testTools.js";
import { registerVisualizationTools } from "./tools/visualization/register.js";

const server = new McpServer({
    name: "githru-mcp",
    version: "0.0.1"
});

registerTestTools(server);
registerVisualizationTools(server);

// ✨ Feature Impact Analyzer
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
      githubToken: z.string().describe("GitHub authentication token"),
      locale: z.enum(["en", "ko"]).default("en").describe("Response language (en: English, ko: Korean)"),
      isChart: z.boolean().default(false).describe("Return HTML chart (true) or JSON (false, default)"),
    },
  },

  async ({ repoUrl, prNumber, githubToken, locale, isChart }: FeatureImpactAnalyzerInputs & { locale?: string; isChart?: boolean }) => {
    try {
      I18n.setLocale(locale || 'en');
      
      const { McpReportGenerator } = await import("./tool/featureImpactAnalyzer.js");
      const analyzeFeatureImpact = new McpReportGenerator({ repoUrl, prNumber, githubToken, locale });

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

// 🏆 Contributor Recommender
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
      
      const { ContributorRecommender } = await import('./tool/contributorRecommender.js');
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

server.registerTool(
  "generate_csm_dict",
  {
    title: "Generate CSM Dictionary",
    description: "Generates CSM (Commit Sequence Map) Dictionary from GitHub repository using AnalysisEngine",
    inputSchema: {
      repo: z.string().describe("GitHub repository (format: 'owner/repo' or 'https://github.com/owner/repo')"),
      githubToken: z.string().describe("GitHub authentication token"),
      baseBranchName: z.string().optional().describe("Base branch name to analyze (default: repository's default branch)"),
      locale: z.enum(["en", "ko"]).default("en").describe("Response language (en: English, ko: Korean)"),
      debug: z.boolean().default(false).describe("Enable debug mode for detailed logging"),
    },
  },

  async ({ repo, githubToken, baseBranchName, locale, debug }: {
    repo: string;
    githubToken: string;
    baseBranchName?: string;
    locale?: string;
    debug?: boolean;
  }) => {
    try {
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

server.registerTool(
  "react_component_test",
  {
    title: "React Component Test",
    description: "Provides React components of varying complexity to test Claude's understanding capabilities",
    inputSchema: {
      complexity: z.enum(["simple", "medium", "complex", "all"]).default("simple").describe("Complexity level of React components to test"),
      componentType: z.enum(["basic", "chart", "form", "data-display", "interactive"]).optional().describe("Type of component to generate"),
    },
  },

  async ({ complexity, componentType }: ReactComponentTestInputs) => {
    try {
      const result = await testReactComponents({ complexity, componentType });

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          { type: "text", text: `React component test error: ${err?.message ?? String(err)}` },
        ],
      };
    }
  }
);

server.registerTool(
  "data_driven_component_test",
  {
    title: "Data-Driven React Component Test",
    description: "Provides React components that work with data props to test Claude's understanding of data-driven patterns",
    inputSchema: {
      dataType: z.enum(["chart", "table", "list", "card", "all"]).default("all").describe("Type of data-driven component to test"),
      sampleData: z.boolean().default(true).describe("Include sample data with components"),
    },
  },

  async ({ dataType, sampleData }: DataDrivenComponentInputs) => {
    try {
      const result = await testDataDrivenComponents({ dataType, sampleData });

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          { type: "text", text: `Data-driven component test error: ${err?.message ?? String(err)}` },
        ],
      };
    }
  }
);

server.registerTool(
  "render_storyline_ui",
  {
    title: "Render Storyline UI",
    description: "Generate storyline visualization using FolderActivityFlow component with CSMDict data",
    inputSchema: {
      repo: z.string().describe("GitHub repository in format 'owner/repo'"),
      githubToken: z.string().describe("GitHub personal access token"),
      baseBranchName: z.string().optional().describe("Base branch name (default: main)"),
      locale: z.enum(["en", "ko"]).default("en").describe("Response language"),
      debug: z.boolean().default(false).describe("Enable debug logging")
    }
  },

  async ({ repo, githubToken, baseBranchName, locale, debug }) => {
    try {
      const result = await renderStorylineUI({
        repo,
        githubToken,
        baseBranchName,
        locale,
        debug
      });

      if (result.type === 'image') {
        return {
          content: [
            {
              type: "text",
              text: "# 📊 Storyline Visualization\n\nGenerated storyline chart showing contributor activity flow across releases:",
            },
            {
              type: "image",
              data: result.data,
              mimeType: result.mimeType,
              annotations: result.annotations
            }
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: `# 📊 Storyline Visualization\n\n${result.data}`,
            },
          ],
        };
      }
    } catch (err: any) {
      return {
        content: [
          { type: "text", text: `Storyline UI rendering error: ${err?.message ?? String(err)}` },
        ],
      };
    }
  }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((err) => {
    console.error("Server error:", err);
    process.exit(1);
});