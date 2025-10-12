import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { I18n } from "../../common/i18n.js";
import { AuthorWorkPatternAnalyzer, AuthorWorkPatternArgs } from "../../core/authorWorkPattern.js";

export function registerAuthorWorkPatternTool(server: McpServer) {
  server.registerTool(
    "author_work_pattern",
    {
      title: "Author별 작업량/변경유형 분석기",
      description:
        "특정 author의 기간 내 작업량(Commits/LOC/Churn)과 커밋 타입(feat/fix/refactor/...) 분포를 Octokit으로 계산합니다.",
      inputSchema: {
        repoPath: z.string().describe("GitHub repository path (owner/repo 또는 GitHub URL)"),
        author: z.string().describe("로그인/이름/이메일 일부"),
        branch: z.string().optional().describe("브랜치/커밋 SHA (기본: 기본 브랜치)"),
        since: z.string().optional().describe('시작 시점 (예: "2025-09-01" 또는 "30d")'),
        until: z.string().optional().describe("종료 시점 (미지정 시 현재)"),
        locale: z.enum(["en", "ko"]).default("en").describe("응답 언어"),
        chart: z.boolean().default(false).describe("HTML 차트 리포트 반환 여부"),
      },
    },

    async ({
      repoPath,
      author,
      branch,
      since,
      until,
      locale,
      chart,
    }: AuthorWorkPatternArgs & { locale?: "en" | "ko"; chart?: boolean }) => {
      try {
        I18n.setLocale(locale || "en");

        const analyzer = new AuthorWorkPatternAnalyzer({
          repoPath,
          author,
          branch,
          since,
          until,
          locale,
          chart,
        });

        const payload = await analyzer.analyze();

        if (chart) {
          return await analyzer.generateReport(payload);
        }

        return {
          content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
        };
      } catch (err: any) {
        return {
          content: [
            {
              type: "text",
              text: `${I18n.t("errors.author_work_analysis")} ${err?.message ?? String(err)}`,
            },
          ],
        };
      }
    }
  );
}
