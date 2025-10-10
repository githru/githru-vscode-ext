import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { renderStorylineUI } from "../../tool/storylineRenderer.js";

export function registerStorylineUITool(server: McpServer) {
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
}