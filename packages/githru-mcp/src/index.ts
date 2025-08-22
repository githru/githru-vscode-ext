import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

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
