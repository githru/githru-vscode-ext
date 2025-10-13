import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { testReactComponents } from "../../core/reactComponentTester.js";
import type { ReactComponentTestInputs } from "../../common/types.js";

export function registerReactComponentTestTool(server: McpServer) {
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
}