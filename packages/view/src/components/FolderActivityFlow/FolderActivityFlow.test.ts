import type { ClusterNode } from "types";
import {
  groupCommitsByReleaseTags,
  analyzeReleaseFolderActivity,
  getTopFoldersByRelease
} from "./FolderActivityFlow.releaseAnalyzer";

// 테스트 데이터 생성
export function createTestData(): ClusterNode[] {
  return [
    {
      nodeTypeName: "CLUSTER",
      commitNodeList: [
        {
          nodeTypeName: "COMMIT",
          commit: {
            id: "commit1",
            parentIds: [],
            author: {
              id: "user1",
              names: ["이규환"],
              emails: ["user1@example.com"]
            },
            committer: {
              id: "user1",
              names: ["이규환"],
              emails: ["user1@example.com"]
            },
            authorDate: "Mon Sep 29 2025 18:35:18 GMT+0900",
            commitDate: "Mon Sep 29 2025 18:35:18 GMT+0900",
            diffStatistics: {
              changedFileCount: 2,
              insertions: 100,
              deletions: 20,
              files: {
                "src/components/Button.tsx": { insertions: 50, deletions: 10 },
                "src/utils/helper.ts": { insertions: 50, deletions: 10 }
              }
            },
            message: "feat: add button component",
            tags: [],
            releaseTags: ["v1.0.0"]
          },
          seq: 1,
          clusterId: 1
        },
        {
          nodeTypeName: "COMMIT",
          commit: {
            id: "commit2",
            parentIds: ["commit1"],
            author: {
              id: "user2",
              names: ["김개발"],
              emails: ["user2@example.com"]
            },
            committer: {
              id: "user2",
              names: ["김개발"],
              emails: ["user2@example.com"]
            },
            authorDate: "Tue Sep 30 2025 10:00:00 GMT+0900",
            commitDate: "Tue Sep 30 2025 10:00:00 GMT+0900",
            diffStatistics: {
              changedFileCount: 1,
              insertions: 30,
              deletions: 5,
              files: {
                "src/components/Input.tsx": { insertions: 30, deletions: 5 }
              }
            },
            message: "feat: add input component",
            tags: [],
            releaseTags: [] // releaseTags 없음 -> 이전 v1.0.0과 합쳐짐
          },
          seq: 2,
          clusterId: 1
        },
        {
          nodeTypeName: "COMMIT",
          commit: {
            id: "commit3",
            parentIds: ["commit2"],
            author: {
              id: "user1",
              names: ["이규환"],
              emails: ["user1@example.com"]
            },
            committer: {
              id: "user1",
              names: ["이규환"],
              emails: ["user1@example.com"]
            },
            authorDate: "Wed Oct 01 2025 14:30:00 GMT+0900",
            commitDate: "Wed Oct 01 2025 14:30:00 GMT+0900",
            diffStatistics: {
              changedFileCount: 2,
              insertions: 80,
              deletions: 15,
              files: {
                "src/pages/Home.tsx": { insertions: 60, deletions: 10 },
                "src/styles/main.css": { insertions: 20, deletions: 5 }
              }
            },
            message: "feat: add home page",
            tags: [],
            releaseTags: ["v1.1.0"]
          },
          seq: 3,
          clusterId: 2
        }
      ]
    }
  ] as ClusterNode[];
}

// 테스트 실행 함수
export function testReleaseAnalyzer() {
  console.log("🧪 Testing Release Analyzer...");

  const testData = createTestData();
  console.log("📊 Test data created:", testData);

  // 1. 릴리즈 그룹 테스트
  const releaseGroups = groupCommitsByReleaseTags(testData);
  console.log("🏷️ Release groups:", releaseGroups);

  // 2. 릴리즈별 폴더 활동 분석 테스트
  const folderActivities = analyzeReleaseFolderActivity(releaseGroups);
  console.log("📁 Folder activities by release:", folderActivities);

  // 3. 상위 폴더 추출 테스트
  const topFoldersResult = getTopFoldersByRelease(testData, 5, 1);
  console.log("🔝 Top folders result:", topFoldersResult);

  console.log("✅ Release analyzer test completed!");

  return {
    releaseGroups,
    folderActivities,
    topFoldersResult
  };
}