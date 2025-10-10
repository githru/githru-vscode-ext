import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { testDataDrivenComponents } from "../../tool/dataDrivenComponentTester.js";
import type { DataDrivenComponentInputs } from "../../common/types.js";

export function registerDataDrivenComponentTestTool(server: McpServer) {
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
}