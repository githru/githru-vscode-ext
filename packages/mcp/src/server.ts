import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTestTools } from "./tools/test/testTools.js";
import { registerVisualizationTools } from "./tools/visualization/register.js";
import { registerReactTools } from "./tools/react/register.js";
import { registerContributorRecommenderTool } from "./tools/analysis/contributorRecommenderTool.js";
import { registerFeatureImpactTool } from "./tools/analysis/featureImpactTool.js";
import { registerStorylineUITool } from "./tools/storyLineUI/storyLineUITool.js";
import { registerAuthorWorkPatternTool } from "tools/analysis/authorWorkPatternTool.js";

const server = new McpServer({
  name: "githru-mcp",
  version: "0.0.1",
});

registerTestTools(server);
registerVisualizationTools(server);
registerReactTools(server);
registerContributorRecommenderTool(server);
registerFeatureImpactTool(server);
registerStorylineUITool(server);
registerAuthorWorkPatternTool;

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Server error:", err);
  process.exit(1);
});
