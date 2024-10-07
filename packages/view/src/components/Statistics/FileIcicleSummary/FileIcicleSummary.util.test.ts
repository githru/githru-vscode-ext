import type { ClusterNode } from "types";

import { fakePrev } from "../../../../tests/fakeAsset";

import type { FileChangesMap, FileScoresMap, FileChangesNode } from "./FileIcicleSummary.type";
import { getFileChangesMap, getFileScoresMap, getFileChangesTree } from "./FileIcicleSummary.util";

describe("getFileChangesMap", () => {
  it("should return empty object if no data is provided", () => {
    const fakeData: ClusterNode[] = [];
    const result = getFileChangesMap(fakeData);

    expect(result).not.toBeUndefined();
    expect(result).toEqual({});
  });

  it("should return summed insertions, deletions and commits for each file", () => {
    const result = getFileChangesMap(fakePrev);

    expect(result).not.toBeUndefined();
    expect(result).toEqual({
      "package-lock.json": { insertions: 751, deletions: 15, commits: 2 },
      "packages/view/.gitignore": { insertions: 2, deletions: 0, commits: 1 },
      "packages/view/package.json": { insertions: 10, deletions: 4, commits: 2 },
      "packages/view/src/reportWebVitals.js": { insertions: 0, deletions: 13, commits: 1 },
      "packages/vscode/.eslintrc.json": { insertions: 15, deletions: 7, commits: 1 },
      "packages/vscode/CHANGELOG.md": { insertions: 0, deletions: 9, commits: 1 },
    } as FileChangesMap);
  });
});

describe("getFileScoresMap", () => {
  it("should return empty object if no data is provided", () => {
    const fakeData: ClusterNode[] = [];
    const result = getFileScoresMap(fakeData);

    expect(result).not.toBeUndefined();
    expect(result).toEqual({});
  });

  it("should return score for each file", () => {
    const result = getFileScoresMap(fakePrev);

    expect(result).not.toBeUndefined();
    expect(result).toEqual({
      "package-lock.json": 1,
      "packages/view/.gitignore": 1,
      "packages/view/package.json": 1,
      "packages/view/src/reportWebVitals.js": 1,
      "packages/vscode/.eslintrc.json": 1,
      "packages/vscode/CHANGELOG.md": 1,
    } as FileScoresMap);
  });
});

describe("getFileChangesTree", () => {
  it("should return empty object if no data is provided", () => {
    const fakeData: ClusterNode[] = [];
    const result = getFileChangesTree(fakeData);

    expect(result).not.toBeUndefined();
    expect(result).toEqual({ name: "root", children: [] } as FileChangesNode);
  });

  it("should represent file changes in tree structure", () => {
    const result = getFileChangesTree(fakePrev);

    expect(result).not.toBeUndefined();
    expect(result.name).toBe("root");
    expect(result.children).toHaveLength(2);
    expect(result).toEqual({
      name: "root",
      children: [
        { name: "package-lock.json", children: [], value: 1, insertions: 751, deletions: 15, commits: 2 },
        {
          name: "packages",
          children: [
            {
              name: "view",
              children: [
                { name: ".gitignore", children: [], value: 1, insertions: 2, deletions: 0, commits: 1 },
                { name: "package.json", children: [], value: 1, insertions: 10, deletions: 4, commits: 2 },
                {
                  name: "src",
                  children: [
                    { name: "reportWebVitals.js", children: [], value: 1, insertions: 0, deletions: 13, commits: 1 },
                  ],
                },
              ],
            },
            {
              name: "vscode",
              children: [
                { name: ".eslintrc.json", children: [], value: 1, insertions: 15, deletions: 7, commits: 1 },
                { name: "CHANGELOG.md", children: [], value: 1, insertions: 0, deletions: 9, commits: 1 },
              ],
            },
          ],
        },
      ],
    } as FileChangesNode);
  });
});
