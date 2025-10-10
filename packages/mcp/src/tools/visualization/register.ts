import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerDemoChartTool } from "./demoChart.js";
import {registerLocalImageServingTool} from "./imageServing.js";
import { registerRemoteImageServingTool } from "./imageServing.js";

export function registerVisualizationTools(server: McpServer) {
  registerDemoChartTool(server);
  registerLocalImageServingTool(server);
  registerRemoteImageServingTool(server);
}
