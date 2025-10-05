import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import type { FeatureImpactAnalyzerInputs, ContributorRecommenderInputs } from "./common/types.js";
import { I18n } from "./common/i18n.js";

const server = new McpServer({
    name: "githru-mcp",
    version: "0.0.1"
});

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
        description: "Echoes back the input text with multilingual support",
        inputSchema: {
        text: z.string().describe("Text to echo back"),
        locale: z.enum(["en", "ko"]).default("en").describe("Response language (en: English, ko: Korean)")
        }
    },
    async ({ text, locale }: { text: string; locale?: string }) => {
        I18n.setLocale(locale || 'en');
        const response = I18n.t('echo.greeting', { text });
        return { content: [{ type: "text", text: response }] };
    }
);

server.registerTool(
    "bmi_calculator",
    {
        title: "BMI Calculator",
        description: "Calculate BMI index from height(cm) and weight(kg).",
        inputSchema: {
        height: z.number().int().positive().describe("Height (cm)"),
        weight: z.number().int().positive().describe("Weight (kg)")
        }
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
            text: `Height: ${height} cm, Weight: ${weight} kg\nBMI: ${bmi.toFixed(
                2
            )} (${category})`
            },
            {
                type: "text",
                text: 
                    "Chart template source code:\n" +
                    chartTemplate
            }
        ]
        };
    }
);

server.registerTool(
    "demo_chart",
    {
        title: "Demo Chart (SVG)",
        description:
        "Creates a simple bar chart from number array and returns as SVG. Uses random data (6 values) if no input provided.",
        inputSchema: {
            values: z.array(z.number()).min(1).max(20).optional().describe("Bar value array"),
            width: z.number().int().min(120).max(1200).default(360).describe("SVG width (px)"),
            height: z.number().int().min(80).max(800).default(180).describe("SVG height (px)")
        }
    },
    async ({ values, width, height }: { values?: number[]; width?: number; height?: number }) => {
    const data = values && values.length ? values : Array.from({ length: 6 }, () => Math.floor(Math.random() * 10) + 1);

    const W = width ?? 360;
    const H = height ?? 180;
    const pad = 16;
    const barGap = 8;
    const maxVal = Math.max(...data, 1);
    const chartW = W - pad * 2;
    const chartH = H - pad * 2;
    const barW = Math.max(4, Math.floor((chartW - barGap * (data.length - 1)) / data.length));

    const rects = data.map((v, i) => {
      const h = Math.max(1, Math.round((v / maxVal) * chartH));
      const x = pad + i * (barW + barGap);
        const y = H - pad - h;
        return `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="3" ry="3" fill="#888" />`;
    }).join("");

    const axis = `
        <line x1="${pad}" y1="${H - pad}" x2="${W - pad}" y2="${H - pad}" stroke="#999" stroke-width="1"/>
        <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${H - pad}" stroke="#999" stroke-width="1"/>
        <rect x="0" y="0" width="${W}" height="${H}" fill="white" stroke="#ddd"/>
    `;

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        <style>
            text{ font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif; font-size: 10px; fill:#333; }
        </style>
            ${axis}
            ${rects}
        <text x="${pad}" y="${pad - 4}" >Demo Chart</text>
    </svg>`;

    const base64 = Buffer.from(svg, "utf8").toString("base64");

    return {
        content: [
            {
                type: "image",
                mimeType: "image/svg+xml",
                data: base64
            },
        ]
        };
    }
);

server.registerTool(
    "local_image_serving",
    {
        title: "Image Serving Test",
        description: "Give image Claude Desktop",
        inputSchema: {}
    },

    async () => {
        const filePath = "Users/hiro/Desktop/playhive.png";
        try {
            const abs = path.resolve(filePath);
            const stat = await fs.stat(abs);
            if (!stat.isFile()) {
                return { content: [{ type: "text", text: `Not a file: ${abs}` }] };
            }
            
            const MAX = 5 * 1024 * 1024;
            if (stat.size > MAX) {
                return { content: [{ type: "text", text: `File too large (${stat.size} bytes). Max ${MAX} bytes.` }] };
            }

            const buf = await fs.readFile(abs);
            if (!Buffer.isBuffer(buf)) {
                return { content: [{ type: "text", text: `Failed to read as buffer: ${abs}` }] };
            }

            const b64 = buf.toString("base64");

            const ext = path.extname(abs).toLowerCase();
            const mime =
                ext === ".png"  ? "image/png"  :
                ext === ".jpg"  ? "image/jpeg" :
                ext === ".jpeg" ? "image/jpeg" :
                ext === ".svg"  ? "image/svg+xml" :
                "application/octet-stream";

            return {
                content: [
                    { type: "image", mimeType: "image/png", data: b64 },
                    { type: "text", text: `Image served (mime=${mime}, bytes=${stat.size}) from ${abs}` }
                ]
            };
        } catch (err: any) {
            return { content: [{ type: "text", text: `Failed to read image: ${err?.message ?? String(err)}` }] };
        }
    }
);

server.registerTool(
    "image_serving",
    {
        title: "Image Serving Test",
        description: "Give image Claude Desktop",
        inputSchema: {}
    },

    async () => {
        const imageUrl = "https://media.playhive.co.kr/image/Logo.png";
        try {
            const response = await fetch(imageUrl);
            
            if (!response.ok) {
                return { content: [{ type: "text", text: `Failed to fetch image: HTTP ${response.status} ${response.statusText}` }] };
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const b64 = buffer.toString("base64");
            let mime = response.headers.get('content-type') || 'image/png';
            if (!mime.startsWith('image/')) {
                const ext = new URL(imageUrl).pathname.split('.').pop()?.toLowerCase();
                mime = 
                    ext === "png"  ? "image/png"  :
                    ext === "jpg"  ? "image/jpeg" :
                    ext === "jpeg" ? "image/jpeg" :
                    ext === "gif"  ? "image/gif"  :
                    ext === "webp" ? "image/webp" :
                    ext === "svg"  ? "image/svg+xml" :
                    "image/png";
            }

            return {
                content: [
                    { type: "image", mimeType: mime, data: b64 },
                    { type: "text", text: `Image served (mime=${mime}, bytes=${buffer.length}) from ${imageUrl}` }
                ]
            };
        } catch (err) {
            return { content: [{ type: "text", text: `Failed to fetch image: ${String(err)}` }] };
        }
    }
);

// ✨ Feature Impact Analyzer
server.registerTool(
  "feature_impact_analyzer",
  {
    title: "Feature Integration Impact Analyzer",
    description: `
      Takes a GitHub repository URL, Pull Request number, and authentication token as input.
      Analyzes the PR’s commits and changed files to compute impact metrics — scale, dispersion,
      chaos, isolation, lag, and coupling — and outputs a detailed HTML report highlighting
      long-tail file path outliers.
    `.trim(),
    inputSchema: {
      repoUrl: z.string().url().describe("Full URL of GitHub repository to analyze (e.g. https://github.com/owner/repo)"),
      prNumber: z.number().int().positive().describe("Pull Request number to analyze"),
      githubToken: z.string().describe("GitHub authentication token"),
      locale: z.enum(["en", "ko"]).default("en").describe("Response language (en: English, ko: Korean)"),
      chart: z.boolean().default(false).describe("Return HTML chart (true) or JSON (false, default)"),
    },
  },

  async ({ repoUrl, prNumber, githubToken, locale, chart }: FeatureImpactAnalyzerInputs & { locale?: string; chart?: boolean }) => {
    try {
      I18n.setLocale(locale || 'en');
      
      const { McpReportGenerator } = await import("./tool/featureImpactAnalyzer.js");
      const analyzeFeatureImpact = new McpReportGenerator({ repoUrl, prNumber, githubToken, locale });

      const payload = await analyzeFeatureImpact.generateWithOutlierRatings();
      
      if (chart) {
        const chartHtml = analyzeFeatureImpact.generateReport(payload);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(payload, null, 2) + "\n created chart:" + chartHtml
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(payload, null, 2),
            },
          ],
        };
      }
    } catch (err: any) {
      return {
        content: [
          { type: "text", text: `Analysis error occurred: ${err?.message ?? String(err)}` },
        ],
      };
    }
  }
);

// 🏆 Contributor Recommender
server.registerTool(
  "contributor_recommender",
  {
    title: "Code Contributor Recommender",
    description: "Recommends contributors who have contributed most to specific files/branches/PR areas by aggregating recent contribution data.",
    inputSchema: {
      repoPath: z.string().describe("GitHub repository path (e.g: owner/repo or https://github.com/owner/repo)"),
      pr: z.union([z.string(), z.number()]).optional().describe("PR-based recommendation (PR number)"),
      paths: z.array(z.string()).optional().describe("File/directory path array (supports glob patterns)"),
      branch: z.string().optional().describe("Branch-based recommendation (default: main)"),
      since: z.string().optional().describe("Analysis period start (default 90 days, 30d/ISO date etc.)"),
      until: z.string().optional().describe("Analysis period end (current if unspecified)"),
      githubToken: z.string().describe("GitHub authentication token"),
      locale: z.enum(["en", "ko"]).default("en").describe("Response language (en: English, ko: Korean)"),
      chart: z.boolean().default(false).describe("Generate interactive chart visualization (true: HTML chart display, false: JSON data)"),
    },
  },

  async ({ repoPath, pr, paths, branch, since, until, githubToken, locale, chart }: ContributorRecommenderInputs & { locale?: string; chart?: boolean }) => {
    try {
      I18n.setLocale(locale || 'en');
      
      const { ContributorRecommender } = await import('./tool/contributorRecommender.js');
      const recommender = new ContributorRecommender({
        repoPath,
        pr,
        paths,
        branch,
        since,
        until,
        githubToken,
        locale,
      });
      
      const recommendation = await recommender.analyze();

      if (chart) {
        const chartHtml = recommender.generateChart(recommendation);
        return {
          content: [
            {
              type: "text",
              text: chartHtml,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(recommendation, null, 2),
            },
          ],
        };
      }
    } catch (err: any) {
      return {
        content: [
          { type: "text", text: `Contributor recommendation error occurred: ${err?.message ?? String(err)}` },
        ],
      };
    }
  }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((err) => {
    console.error("Server error:", err);
    process.exit(1);
});