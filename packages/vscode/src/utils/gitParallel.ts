import os from "os";
import * as path from "path";
import { Worker } from "worker_threads";

import { WorkerThreadError } from "../errors/GitError";

export const TASK_THRESHOLD = 1000;
export const CORE_COUNT_THRESHOLD = 4;
export const THREAD_COUNTS = {
  MIN: 1,
  MEDIUM: 2,
  MAX: 3,
} as const;

export interface WorkerConfig {
  taskThreshold: number;
  coreCountThreshold: number;
  workerScriptPath: string;
}

export interface WorkerTask {
  gitPath: string;
  currentWorkspacePath: string;
  skipCount: number;
  limitCount: number;
}

export interface WorkerTaskParams extends Pick<WorkerTask, "gitPath" | "currentWorkspacePath"> {
  totalCnt: number;
  threadCount: number;
}

export class GitParallelWorkerManager {
  private readonly config: WorkerConfig;
  private workers: Worker[] = [];

  constructor(workerScriptPath: string, config: Partial<WorkerConfig> = {}) {
    this.config = {
      taskThreshold: TASK_THRESHOLD,
      coreCountThreshold: CORE_COUNT_THRESHOLD,
      workerScriptPath,
      ...config,
    };
  }

  private calculateThreadCount(totalCnt: number) {
    const numCores = os.cpus().length;

    if (totalCnt <= this.config.taskThreshold) return THREAD_COUNTS.MIN;
    if (numCores < this.config.coreCountThreshold) return THREAD_COUNTS.MEDIUM;
    return THREAD_COUNTS.MAX;
  }

  private createWorkerTasks({ gitPath, currentWorkspacePath, totalCnt, threadCount }: WorkerTaskParams) {
    const chunkSize = Math.ceil(totalCnt / threadCount);
    const tasks: WorkerTask[] = [];

    for (let i = 0; i < threadCount; i++) {
      tasks.push({
        gitPath,
        currentWorkspacePath,
        skipCount: i * chunkSize,
        limitCount: chunkSize,
      });
    }

    return tasks;
  }

  private createWorker(task: WorkerTask) {
    const worker = new Worker(this.config.workerScriptPath, {
      workerData: task,
    });

    this.workers.push(worker);

    return new Promise((resolve, reject) => {
      worker.on("message", (result: string) => resolve(result));
      worker.on("error", (error: Error) => {
        reject(new WorkerThreadError(`Worker error: ${error.message}`, task));
      });
      worker.on("exit", (code) => {
        if (code !== 0) reject(new WorkerThreadError(`Worker stopped with exit code ${code}`, task));
      });
    });
  }

  async executeParallelGitLog(gitPath: string, currentWorkspacePath: string, totalCnt: number) {
    try {
      const threadCount = this.calculateThreadCount(totalCnt);
      const tasks = this.createWorkerTasks({ gitPath, currentWorkspacePath, totalCnt, threadCount });

      const promises = tasks.map((task) => this.createWorker(task));
      const results = await Promise.all(promises);

      return results.join("\n");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new WorkerThreadError(`Unexpected error in executeParallelGitLog: ${errorMessage}`);
    } finally {
      await this.cleanup();
    }
  }

  async cleanup() {
    const terminationPromises = this.workers.map((worker) => worker.terminate());
    await Promise.all(terminationPromises);
    this.workers = [];
  }

  getActiveWorkerCount() {
    return this.workers.length;
  }
}
