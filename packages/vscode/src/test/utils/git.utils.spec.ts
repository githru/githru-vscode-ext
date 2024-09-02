import * as cp from "child_process";

import { getGitLog } from "../../utils/git.util";

jest.mock("child_process");
const mockSpawn = cp.spawn as jest.Mock;

mockSpawn.mockImplementation(() => {
  const cmd = {
    stdout: {
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === "data") {
          callback(Buffer.from("commit 1234567\nAuthor: Test User\nDate: Today\n\n    Initial commit"));
        }
        if (event === "close") {
          callback(); // stdout 스트림이 종료되면 호출됨
        }
      }),
    },
    stderr: {
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === "data") {
          callback("mocked error message");
        }
        if (event === "close") {
          callback(); // stderr 스트림이 종료되면 호출됨
        }
      }),
    },
    on: jest.fn().mockImplementation((event, callback) => {
      if (event === "exit") {
        callback(0); // 프로세스가 정상적으로 종료되었음을 나타냄
      }
    }),
  };
  return cmd;
});

describe("getGitLog with actual resolveSpawnOutput", () => {
  it("should return git log output", async () => {
    console.time("getGitLog Performance");
    const result = await getGitLog("/usr/bin/git", "/path/to/repo");
    console.timeEnd("getGitLog Performance");

    expect(result).toContain("commit 1234567");
    expect(result).toContain("Author: Test User");
    expect(result).toContain("Initial commit");
  });
});
