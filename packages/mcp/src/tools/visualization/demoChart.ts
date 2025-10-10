import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerDemoChartTool(server: McpServer) {
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
}