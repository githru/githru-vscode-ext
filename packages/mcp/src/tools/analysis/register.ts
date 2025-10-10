import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerContributorRecommenderTool } from "./contributorRecommenderTool.js";
import { registerFeatureImpactTool } from "./featureImpactTool.js";
import { registerAuthorWorkPatternTool } from "./authorWorkPatternTool.js";

export function registerAnalysisTools(server: McpServer) {
  registerContributorRecommenderTool(server);
  registerFeatureImpactTool(server);
  registerAuthorWorkPatternTool(server);
}