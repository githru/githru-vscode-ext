import * as cp from "child_process";

import { getGitLog } from "../../utils/git.util";

const generateMockGitLogData = (index: number) => `
commit ${index}1234567890abcdef1234567890abcdef${index}5678 (HEAD -> main)
Author: Mock User ${index} <mock${index}@example.com>
AuthorDate: Mon Sep ${index} 21:42:00 2023 +0000
Commit: Mock Committer ${index} <committer${index}@example.com>
CommitDate: Mon Sep ${index} 21:43:00 2023 +0000

    Commit message ${index}
`;

jest.mock("child_process");
const mockSpawn = cp.spawn as jest.Mock;

let mockSpawnCallCount = 0;

mockSpawn.mockImplementation(() => {
  return {
    stdout: {
      on: jest.fn((event, callback) => {
        if (event === "data") {
          const mockData = generateMockGitLogData(mockSpawnCallCount);
          callback(Buffer.from(mockData));
          mockSpawnCallCount++;
        }
        if (event === "close") {
          callback();
        }
      }),
    },
    stderr: {
      on: jest.fn((event, callback) => {
        callback(Buffer.from("mocked error message"));
      }),
    },
    on: jest.fn((event, callback) => {
      if (event === "exit") {
        callback(0);
      }
    }),
  };
});

describe("getGitLog util test", () => {
  afterEach(() => {
    mockSpawnCallCount = 0; // initailize call count
  });

  it("should return the combined git log output from number of threads", async () => {
    const result = await getGitLog("git", "/mocked/path/to/repo");

    const expectedData = Array.from({ length: mockSpawnCallCount }) // Create an array with length equal to call count
      .map((_, index) => generateMockGitLogData(index)) // Insert mock data into the array for each index
      .join(""); // Concatenate all mock data into a single string

    return expect(result).toEqual(expectedData);
  });
});
