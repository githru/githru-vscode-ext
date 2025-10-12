import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { registerStorylineUITool } from "./tools/storyLineUI/storyLineUITool.js";
import { registerAnalysisTools } from "./tools/analysis/register.js";

export const configSchema = z.object({
  debug: z.boolean().default(false).describe("Enable debug logging"),
});

export default function createStatelessServer({
  config,
  sessionId,
}: {
  config: z.infer<typeof configSchema>;
  sessionId: string;
}) {
  const server = new McpServer({
    name: "Githru MCP Server",
    version: "1.0.0",
  });

  registerAnalysisTools(server);
  registerStorylineUITool(server);

  return server.server;
}
