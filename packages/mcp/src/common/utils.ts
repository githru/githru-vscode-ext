import { Octokit } from "@octokit/rest";
import type { GitHubRepoInfo } from "./types.js";

/**
 * GitHub 관련 유틸리티 함수들
 * 모든 함수는 순수 함수로 작성하여 사이드 이펙트를 방지합니다.
 */
export const GitHubUtils = {
  /**
   * GitHub API 클라이언트를 생성합니다
   */
  createClient(githubToken: string): Octokit {
    return new Octokit({ auth: githubToken });
  },

  /**
   * GitHub 저장소 URL 또는 path를 파싱하여 owner/repo 정보를 추출합니다
   */
  parseRepoUrl(repoUrlOrPath: string): GitHubRepoInfo {
    const cleaned = repoUrlOrPath
      .replace(/^https?:\/\/github\.com\//, "")
      .replace(/\.git$/, "")
      .replace(/\/+$/, "");
    
    const [owner, repo] = cleaned.split("/");
    
    if (!owner || !repo) {
      throw new Error(`Invalid repository path: ${repoUrlOrPath}. Expected format: "owner/repo" or "https://github.com/owner/repo"`);
    }
    
    return { owner, repo };
  },

  /**
   * 날짜 범위를 파싱합니다
   */
  parseTimeRange(since?: string, until?: string): { since: string; until: string } {
    const now = new Date();
    
    // since 파싱
    let sinceDate: Date;
    if (!since) {
      // 기본값: 90일 전
      sinceDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (since.endsWith('d')) {
      // "30d" 형태
      const days = parseInt(since.replace('d', ''));
      if (isNaN(days)) {
        throw new Error(`Invalid days format: ${since}. Expected format: "30d"`);
      }
      sinceDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    } else {
      // ISO 날짜 형태
      sinceDate = new Date(since);
      if (isNaN(sinceDate.getTime())) {
        throw new Error(`Invalid date format: ${since}. Expected ISO date or "30d" format`);
      }
    }

    // until 파싱
    let untilDate: Date = now;
    if (until) {
      untilDate = new Date(until);
      if (isNaN(untilDate.getTime())) {
        throw new Error(`Invalid date format: ${until}. Expected ISO date format`);
      }
    }

    return {
      since: sinceDate.toISOString(),
      until: untilDate.toISOString(),
    };
  },

  /**
   * 에러를 안전하게 처리하는 래퍼 함수
   */
  async safeApiCall<T>(
    apiCall: () => Promise<T>,
    errorMessage: string
  ): Promise<T> {
    try {
      return await apiCall();
    } catch (error: any) {
      const status = error?.status || error?.response?.status;
      const message = error?.message || String(error);
      
      if (status === 401) {
        throw new Error(`GitHub 인증 오류: 토큰을 확인해주세요. ${message}`);
      } else if (status === 403) {
        throw new Error(`GitHub API 권한 오류: ${message}`);
      } else if (status === 404) {
        throw new Error(`저장소를 찾을 수 없습니다: ${message}`);
      } else {
        throw new Error(`${errorMessage}: ${message}`);
      }
    }
  }
};

/**
 * 일반적인 유틸리티 함수들
 */
export const CommonUtils = {
  /**
   * 계산된 일수를 반환합니다
   */
  getDaysDifference(startDate: string, endDate?: string): number {
    const start = new Date(startDate).getTime();
    const end = endDate ? new Date(endDate).getTime() : new Date().getTime();
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  },

  /**
   * 배열을 청크 단위로 나눕니다 (성능 최적화용)
   */
  chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  },

  /**
   * 안전하게 숫자로 변환합니다
   */
  safeParseInt(value: string | number): number {
    if (typeof value === 'number') return value;
    const parsed = parseInt(value);
    return isNaN(parsed) ? 0 : parsed;
  }
};
