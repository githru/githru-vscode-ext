import type { CommitNode } from "types";

import { fakeReleaseCommitNode1, fakeReleaseCommitNode2, fakeReleaseCommitNode3 } from "../../../tests/fakeAsset";

import {
  groupCommitsByReleaseTags,
  analyzeReleaseFolderActivity,
  getTopFoldersByRelease,
  extractFolderFromPath,
  extractReleaseContributorActivities,
  type ReleaseGroup,
} from "./FolderActivityFlow.releaseAnalyzer";

describe("FolderActivityFlow.releaseAnalyzer", () => {
  describe("extractFolderFromPath", () => {
    it("should extract folder from file path", () => {
      expect(extractFolderFromPath("src/components/Button.tsx", 1)).toBe("src");
      expect(extractFolderFromPath("src/components/Button.tsx", 2)).toBe("src/components");
      expect(extractFolderFromPath("README.md", 1)).toBe(".");
      expect(extractFolderFromPath("src/test.ts", 10)).toBe("src");
    });
  });

  describe("groupCommitsByReleaseTags", () => {
    it("should group commits by release tags", () => {
      const clusterNodes = [fakeReleaseCommitNode1, fakeReleaseCommitNode2];
      const result = groupCommitsByReleaseTags(clusterNodes);

      expect(result).toHaveLength(2);
      expect(result[0].releaseTag).toBe("v1.0.0");
      expect(result[0].commits[0].id).toBe("release-commit-1");
      expect(result[1].releaseTag).toBe("v1.1.0");
    });

    it("should include commits without releaseTags into previous release", () => {
      const commitWithTag = fakeReleaseCommitNode1.commitNodeList[0].commit;
      const commitWithoutTag = {
        ...commitWithTag,
        id: "no-tag-commit",
        releaseTags: [],
      };

      const clusterWithMixedCommits = {
        nodeTypeName: "CLUSTER" as const,
        commitNodeList: [
          fakeReleaseCommitNode1.commitNodeList[0],
          {
            ...fakeReleaseCommitNode1.commitNodeList[0],
            commit: commitWithoutTag,
          } as CommitNode,
        ],
      };

      const result = groupCommitsByReleaseTags([clusterWithMixedCommits]);

      expect(result).toHaveLength(1);
      expect(result[0].releaseTag).toBe("v1.0.0");
      expect(result[0].commits).toHaveLength(2);
    });

    it("should create Pre-release group when no releaseTags exist", () => {
      const commitNoTag = {
        ...fakeReleaseCommitNode1.commitNodeList[0].commit,
        releaseTags: [],
      };

      const clusterNoTag = {
        nodeTypeName: "CLUSTER" as const,
        commitNodeList: [
          {
            ...fakeReleaseCommitNode1.commitNodeList[0],
            commit: commitNoTag,
          } as CommitNode,
        ],
      };

      const result = groupCommitsByReleaseTags([clusterNoTag]);

      expect(result).toHaveLength(1);
      expect(result[0].releaseTag).toBe("Pre-release");
    });
  });

  describe("analyzeReleaseFolderActivity", () => {
    it("should analyze folder activity and track contributors", () => {
      const clusterNodes = [fakeReleaseCommitNode1, fakeReleaseCommitNode2];
      const releaseGroups = groupCommitsByReleaseTags(clusterNodes);
      const result = analyzeReleaseFolderActivity(releaseGroups, 2);

      expect(result).toHaveLength(2);

      const v1Activity = result.find((r) => r.releaseTag === "v1.0.0");
      expect(v1Activity?.folderPath).toBe("src/components");
      expect(v1Activity?.totalChanges).toBe(60);
      expect(v1Activity?.insertions).toBe(50);
      expect(v1Activity?.deletions).toBe(10);
      expect(v1Activity?.commitCount).toBe(1);
      expect(v1Activity?.contributors).toContain("Alice");

      const v11Activity = result.find((r) => r.releaseTag === "v1.1.0");
      expect(v11Activity?.folderPath).toBe("src/components");
      expect(v11Activity?.contributors).toContain("Bob");
    });
  });

  describe("getTopFoldersByRelease", () => {
    it("should extract and sort top folders by total changes", () => {
      const multiFileCommit = {
        ...fakeReleaseCommitNode3.commitNodeList[0].commit,
        diffStatistics: {
          changedFileCount: 3,
          insertions: 180,
          deletions: 30,
          files: {
            "src/components/Button.tsx": { insertions: 100, deletions: 20 },
            "src/utils/helper.ts": { insertions: 30, deletions: 5 },
            "src/pages/Home.tsx": { insertions: 50, deletions: 5 },
          },
        },
      };

      const clusterWithMultipleFiles = {
        nodeTypeName: "CLUSTER" as const,
        commitNodeList: [
          {
            ...fakeReleaseCommitNode3.commitNodeList[0],
            commit: multiFileCommit,
          } as CommitNode,
        ],
      };

      const result = getTopFoldersByRelease([clusterWithMultipleFiles], 5, 2);

      expect(result.releaseGroups).toHaveLength(1);
      expect(result.topFolders).toHaveLength(3);
      expect(result.topFolders[0]).toBe("src/components");
      expect(result.topFolders[1]).toBe("src/pages");
      expect(result.topFolders[2]).toBe("src/utils");
    });
  });

  describe("extractReleaseContributorActivities", () => {
    it("should extract contributor activities per release", () => {
      const clusterNodes = [fakeReleaseCommitNode1, fakeReleaseCommitNode2];
      const releaseGroups = groupCommitsByReleaseTags(clusterNodes);

      const topFolders = ["src/components"];
      const result = extractReleaseContributorActivities(releaseGroups, topFolders, 2);

      expect(result).toHaveLength(2);

      const aliceActivity = result.find((a) => a.contributorName === "Alice");
      expect(aliceActivity?.folderPath).toBe("src/components");
      expect(aliceActivity?.changes).toBe(60);

      const bobActivity = result.find((a) => a.contributorName === "Bob");
      expect(bobActivity?.changes).toBe(35);
    });

    it("should filter out folders not in topFolders", () => {
      const multiFileCommit = {
        ...fakeReleaseCommitNode1.commitNodeList[0].commit,
        diffStatistics: {
          changedFileCount: 2,
          insertions: 80,
          deletions: 15,
          files: {
            "src/components/Button.tsx": { insertions: 50, deletions: 10 },
            "src/pages/Home.tsx": { insertions: 30, deletions: 5 },
          },
        },
      };

      const releaseGroups: ReleaseGroup[] = [
        {
          releaseTag: "v1.0.0",
          commitCount: 1,
          dateRange: {
            start: new Date(multiFileCommit.commitDate),
            end: new Date(multiFileCommit.commitDate),
          },
          commits: [multiFileCommit],
        },
      ];

      const topFolders = ["src/components"];
      const result = extractReleaseContributorActivities(releaseGroups, topFolders, 2);

      expect(result).toHaveLength(1);
      expect(result[0].folderPath).toBe("src/components");
      expect(result[0].changes).toBe(60);
    });
  });

  describe("integration test", () => {
    it("should complete full flow with multiple releases, folders, and contributors", () => {
      const clusterNodes = [fakeReleaseCommitNode1, fakeReleaseCommitNode2, fakeReleaseCommitNode3];

      // 1. Group commits by release tags
      const releaseGroups = groupCommitsByReleaseTags(clusterNodes);
      expect(releaseGroups).toHaveLength(3);

      // 2. Analyze folder activities
      const folderActivities = analyzeReleaseFolderActivity(releaseGroups, 2);
      expect(folderActivities.length).toBeGreaterThan(0);

      // 3. Get top folders
      const topFolders = getTopFoldersByRelease(clusterNodes, 10, 2);
      expect(topFolders.releaseGroups).toHaveLength(3);
      expect(topFolders.topFolders).toContain("src/components");

      // 4. Extract contributor activities
      const contributorActivities = extractReleaseContributorActivities(releaseGroups, topFolders.topFolders, 2);
      expect(contributorActivities.length).toBeGreaterThan(0);
    });
  });
});
