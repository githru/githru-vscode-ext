import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGenerateCsmDictTool } from "./generateCsmDict.js";
import { registerReactComponentTestTool } from "./reactComponentTest.js";
import { registerDataDrivenComponentTestTool } from "./dataDrivienTest.js";

export function registerReactTools(server: McpServer) {
  registerGenerateCsmDictTool(server);
  registerReactComponentTestTool(server);
  registerDataDrivenComponentTestTool(server);
}