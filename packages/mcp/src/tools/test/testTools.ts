import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getI18n } from "../../common/i18n.js";

export function registerTestTools(server: McpServer) {
  // Ping Tool
  server.registerTool(
    "ping",
    {
      title: "Ping",
      description: "Health check tool",
      inputSchema: {},
    },
    async () => {
      return { content: [{ type: "text", text: "pong" }] };
    }
  );

  // Echo Tool
  server.registerTool(
    "echo",
    {
      title: "Echo",
      description: "Echoes back the input text with multilingual support",
      inputSchema: {
        text: z.string().describe("Text to echo back"),
        locale: z.enum(["en", "ko"]).default("en").describe("Response language (en: English, ko: Korean)"),
      },
    },
    async ({ text, locale }: { text: string; locale?: "en" | "ko" }) => {
      getI18n().setLocale(locale || "en");
      const response = getI18n().t("echo.greeting", { text });
      return { content: [{ type: "text", text: response }] };
    }
  );

  // BMI Calculator Tool
  server.registerTool(
    "bmi_calculator",
    {
      title: "BMI Calculator",
      description: "Calculate BMI index from height(cm) and weight(kg).",
      inputSchema: {
        height: z.number().int().positive().describe("Height (cm)"),
        weight: z.number().int().positive().describe("Weight (kg)"),
      },
    },
    async ({ height, weight }: { height: number; weight: number }) => {
      const hMeters = height / 100; // cm → m
      const bmi = weight / (hMeters * hMeters);
      let category = "Unknown";
      if (bmi < 18.5) category = "Underweight";
      else if (bmi < 24.9) category = "Normal weight";
      else if (bmi < 29.9) category = "Overweight";
      else category = "Obese";

      const chartTemplate = `<!DOCTYPE html>
      <html lang="en">
      <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>BMI Input Chart</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 20px;">
      <h2>Input Bar Chart</h2>
      <p>Simple visualization of height and weight input values.</p>
      <div style="max-width: 480px;">
          <canvas id="bmiChart"></canvas>
      </div>

      <!-- Chart.js CDN -->
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script>
          const height = ${height};
          const weight = ${weight};

          const ctx = document.getElementById('bmiChart').getContext('2d');
          new Chart(ctx, {
          type: 'bar',
          data: {
              labels: ['Height (cm)', 'Weight (kg)'],
              datasets: [{
              label: 'Input Values',
              data: [height, weight]
              }]
          },
          options: {
              responsive: true,
              plugins: {
              legend: { display: false },
              title: { display: true, text: 'Height & Weight' },
              tooltip: { enabled: true }
              },
              scales: {
              y: { beginAtZero: true }
              }
          }
          });
      </script>
      </body>
      </html>`;

      return {
        content: [
          {
            type: "text",
            text: `Height: ${height} cm, Weight: ${weight} kg\nBMI: ${bmi.toFixed(2)} (${category})`,
          },
          {
            type: "text",
            text: "Chart template source code:\n" + chartTemplate,
          },
        ],
      };
    }
  );
}
