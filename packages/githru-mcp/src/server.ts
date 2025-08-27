import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import fs from "node:fs/promises";
import path from "node:path";

// MCP 서버 인스턴스 생성
const server = new McpServer({
    name: "githru-mcp",
    version: "0.0.1"
});

// ping 툴 등록
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

// echo 툴 등록 (파라미터 받기 예제)
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

// bmi_calculator 툴 등록
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

// ---- demo_chart: 아주 단순한 막대차트(SVG) 생성 --------------------------------
server.registerTool(
    "demo_chart",
    {
        title: "Demo Chart (SVG)",
        description:
        "숫자 배열을 받아 간단한 막대차트를 SVG로 만들어 반환합니다. 입력이 없으면 랜덤 데이터(6개)를 사용합니다.",
        inputSchema: {
            values: z.array(z.number()).min(1).max(20).optional().describe("막대 값 배열"),
            width: z.number().int().min(120).max(1200).default(360).describe("SVG 가로(px)"),
            height: z.number().int().min(80).max(800).default(180).describe("SVG 세로(px)")
        }
    },
    async ({ values, width, height }) => {
    // 값 준비 (없으면 랜덤 6개)
    const data = values && values.length ? values : Array.from({ length: 6 }, () => Math.floor(Math.random() * 10) + 1);

    // 레이아웃 계산
    const W = width ?? 360;
    const H = height ?? 180;
    const pad = 16;                 // 여백
    const barGap = 8;               // 막대 간격
    const maxVal = Math.max(...data, 1);
    const chartW = W - pad * 2;
    const chartH = H - pad * 2;
    const barW = Math.max(4, Math.floor((chartW - barGap * (data.length - 1)) / data.length));

    // 막대 <rect> SVG 조립
    const rects = data.map((v, i) => {
      const h = Math.max(1, Math.round((v / maxVal) * chartH));
      const x = pad + i * (barW + barGap);
        const y = H - pad - h;
        return `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="3" ry="3" fill="#888" />`;
    }).join("");

    // 축/테두리 + 타이틀(옵션)
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

    // base64 인코딩하여 image로 반환
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

// 로컬 이미지 제공
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
            
            // 5MB 제한
            const MAX = 5 * 1024 * 1024;
            if (stat.size > MAX) {
                return { content: [{ type: "text", text: `File too large (${stat.size} bytes). Max ${MAX} bytes.` }] };
            }

            // 원격 이미지와 동일한 방식으로 처리
            const buf = await fs.readFile(abs);
            
            // Buffer가 올바르게 읽혔는지 확인
            if (!Buffer.isBuffer(buf)) {
                return { content: [{ type: "text", text: `Failed to read as buffer: ${abs}` }] };
            }

            const b64 = buf.toString("base64");

            // 간단 MIME 추정 (필요시 더 추가)
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

// 원격 이미지 제공
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
            // HTTP 요청으로 원격 이미지 다운로드
            const response = await fetch(imageUrl);
            
            if (!response.ok) {
                return { content: [{ type: "text", text: `Failed to fetch image: HTTP ${response.status} ${response.statusText}` }] };
            }

            // 응답에서 바이너리 데이터 추출
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            // Base64로 인코딩
            const b64 = buffer.toString("base64");

            // Content-Type 헤더에서 MIME 타입 추출 (우선순위)
            let mime = response.headers.get('content-type') || 'image/png';
            
            // Content-Type이 없으면 URL 확장자로 추정
            if (!mime.startsWith('image/')) {
                const ext = new URL(imageUrl).pathname.split('.').pop()?.toLowerCase();
                mime = 
                    ext === "png"  ? "image/png"  :
                    ext === "jpg"  ? "image/jpeg" :
                    ext === "jpeg" ? "image/jpeg" :
                    ext === "gif"  ? "image/gif"  :
                    ext === "webp" ? "image/webp" :
                    ext === "svg"  ? "image/svg+xml" :
                    "image/png"; // 기본값
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


// 메인 실행 (STDIO 연결)
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((err) => {
  // stdout은 프로토콜 채널이므로 로그는 stderr로만 출력
    console.error("Server error:", err);
    process.exit(1);
});