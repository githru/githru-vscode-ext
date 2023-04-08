export type EngineCommand = {
  commandName: EngineCommandNames;
  message?: string;
};

export type EngineCommandNames = "fetchAnalyzedData" | "changeBranchOption";
