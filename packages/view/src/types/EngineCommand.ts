export type EngineCommand = {
  command: EngineCommandNames;
  message?: string;
};

export type EngineCommandNames = "fetchAnalyzedData" | "getBranchList";
