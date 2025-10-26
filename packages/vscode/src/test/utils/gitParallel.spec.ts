import os from "os";
import * as workerThreads from "worker_threads";

import { GitParallelWorkerManager, type WorkerTask } from "../../utils/gitParallel";

jest.mock("os", () => ({
  default: { cpus: jest.fn() },
}));

const mockOS = os as jest.Mocked<typeof os>;

jest.mock("worker_threads", () => ({
  Worker: jest.fn().mockImplementation((_, options) => ({
    on: jest.fn((event, callback) => {
      if (event === "message") {
        Promise.resolve().then(() => {
          const { skipCount, limitCount } = options.workerData;
          callback(`log-${skipCount}-${limitCount}`);
        });
      }
    }),
    terminate: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe("GitParallelWorkerManager", () => {
  let workerManager: GitParallelWorkerManager;

  const setupWorkerTest = (coreCount: number) => {
    mockOS.cpus.mockReturnValue(new Array(coreCount));
    return jest.spyOn(workerThreads, "Worker");
  };

  const expectWorkerData = (
    workerSpy: jest.SpyInstance,
    index: number,
    { skipCount, limitCount }: { skipCount: number; limitCount: number }
  ) => {
    const workerData = (workerSpy.mock.calls[index][1] as { workerData: WorkerTask }).workerData;
    expect(workerData.skipCount).toBe(skipCount);
    expect(workerData.limitCount).toBe(limitCount);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    workerManager = new GitParallelWorkerManager();
  });

  describe("Worker count calculation", () => {
    it("should use 1 worker for tasks with a count of 1000 or less", async () => {
      const workerSpy = setupWorkerTest(8);
      await workerManager.executeParallelGitLog("/usr/bin/git", "/workspace", 500);

      expect(workerSpy).toHaveBeenCalledTimes(1);
      expectWorkerData(workerSpy, 0, { skipCount: 0, limitCount: 500 });
    });

    it("should use 2 workers for tasks exceeding 1000 on less than 4 cores", async () => {
      const workerSpy = setupWorkerTest(2);
      await workerManager.executeParallelGitLog("/usr/bin/git", "/workspace", 1500);

      expect(workerSpy).toHaveBeenCalledTimes(2);
      expectWorkerData(workerSpy, 0, { skipCount: 0, limitCount: 750 });
      expectWorkerData(workerSpy, 1, { skipCount: 750, limitCount: 750 });
    });

    it("should use 3 workers for tasks exceeding 1000 on 4 or more cores", async () => {
      const workerSpy = setupWorkerTest(8);
      await workerManager.executeParallelGitLog("/usr/bin/git", "/workspace", 3000);

      expect(workerSpy).toHaveBeenCalledTimes(3);
      expectWorkerData(workerSpy, 0, { skipCount: 0, limitCount: 1000 });
      expectWorkerData(workerSpy, 1, { skipCount: 1000, limitCount: 1000 });
      expectWorkerData(workerSpy, 2, { skipCount: 2000, limitCount: 1000 });
    });
  });

  describe("Worker task creation", () => {
    it("should create tasks with correct chunk sizes", async () => {
      const workerSpy = setupWorkerTest(8);
      await workerManager.executeParallelGitLog("/usr/bin/git", "/workspace", 1001);

      expect(workerSpy).toHaveBeenCalledTimes(3);
      expectWorkerData(workerSpy, 0, { skipCount: 0, limitCount: 334 });
      expectWorkerData(workerSpy, 1, { skipCount: 334, limitCount: 334 });
      expectWorkerData(workerSpy, 2, { skipCount: 668, limitCount: 334 });
    });
  });

  describe("Error handling", () => {
    let errorWorkerManager: GitParallelWorkerManager;

    beforeAll(() => {
      jest.resetModules();
      jest.doMock("os", () => ({
        default: { cpus: jest.fn().mockReturnValue(new Array(8)) },
      }));
      jest.doMock("worker_threads", () => ({
        Worker: jest.fn().mockImplementation(() => ({
          on: jest.fn((event, callback) => {
            if (event === "error") {
              Promise.resolve().then(() => callback(new Error("Worker failed")));
            }
          }),
          terminate: jest.fn().mockResolvedValue(undefined),
        })),
      }));
    });

    beforeEach(async () => {
      const { GitParallelWorkerManager } = await import("../../utils/gitParallel");
      errorWorkerManager = new GitParallelWorkerManager();
    });

    it("should throw an exception if the worker fails", async () => {
      await expect(errorWorkerManager.executeParallelGitLog("/usr/bin/git", "/workspace", 1500)).rejects.toThrow(
        "Worker error: Worker failed"
      );
    });
  });
});
