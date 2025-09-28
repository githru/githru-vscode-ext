/**
 * 👋 Welcome to your Smithery project!
 * To run your server, run "npm run dev"
 *
 * You might find these resources useful:
 *
 * 🧑‍💻 MCP's TypeScript SDK (helps you define your server)
 * https://github.com/modelcontextprotocol/typescript-sdk
 *
 * 📝 smithery.yaml (defines user-level config, like settings or API keys)
 * https://smithery.ai/docs/build/project-config/smithery-yaml
 *
 * 💻 smithery CLI (run "npx @smithery/cli dev" or explore other commands below)
 * https://smithery.ai/docs/concepts/cli
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Optional: If you have user-level config, define it here
// This should map to the config in your smithery.yaml file
export const configSchema = z.object({
  debug: z.boolean().default(false).describe("Enable debug logging"),
});

export default function createStatelessServer({
  config,
  sessionId,
}: {
  config: z.infer<typeof configSchema>; // Define your config in smithery.yaml
  sessionId: string; // Use the sessionId field for mapping requests to stateful processes
}) {
  const server = new McpServer({
    name: "My MCP Server",
    version: "1.0.0",
  });

  // Add a tool
  server.tool(
    "hello",
    "Say hello to someone",
    {
      name: z.string().describe("Name to greet"),
    },
    async ({ name }) => {
      return {
        content: [{ type: "text", text: `Hello, ${name}!` }],
      };
    }
  );

  server.registerTool(
      "ping",
      {
          title: "Ping",
          description: "Health check tool",
          inputSchema: {}
      },
      async () => {
          return { content: [{ type: "text", text: "pong" }] };
      }
  );

  server.registerTool(
      "echo",
      {
          title: "Echo",
          description: "Echoes back the input text",
          inputSchema: {
          text: z.string().describe("Text to echo back")
          }
      },
      async ({ text }) => {
          return { content: [{ type: "text", text: `Echo: ${text}` }] };
      }
  );

  server.registerTool(
      "bmi_calculator",
      {
          title: "BMI Calculator",
          description: "키(cm)와 몸무게(kg)를 입력받아 BMI 지수를 계산합니다.",
          inputSchema: {
          height: z.number().int().positive().describe("키 (cm 단위)"),
          weight: z.number().int().positive().describe("몸무게 (kg 단위)")
          }
      },

      async ({ height, weight }) => {
          const hMeters = height / 100; // cm → m
          const bmi = weight / (hMeters * hMeters);
          let category = "Unknown";
          if (bmi < 18.5) category = "Underweight";
          else if (bmi < 24.9) category = "Normal weight";
          else if (bmi < 29.9) category = "Overweight";
          else category = "Obese";

      return {
          content: [
              {
              type: "text",
              text: `Height: ${height} cm, Weight: ${weight} kg\nBMI: ${bmi.toFixed(
                  2
              )} (${category})`
              }
          ]
          };
      }
  );

  return server.server;
}
