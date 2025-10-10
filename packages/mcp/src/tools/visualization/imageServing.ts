import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import path from "node:path";
import fs from "node:fs/promises";

export function registerLocalImageServingTool(server: McpServer) {
  server.registerTool(
    "local_image_serving",
    {
      title: "Image Serving Test",
      description: "Give image Claude Desktop",
      inputSchema: {}
    },

    async () => {
      const filePath = "src/resources/image/logo.png";
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
}

export function registerRemoteImageServingTool(server: McpServer) {
  server.registerTool(
    "remote_image_serving",
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
}
