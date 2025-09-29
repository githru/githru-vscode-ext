import type IDEPort from "ide/IDEPort";
import { container } from "container";
import { SERVICE_TOKENS } from "container/tokens";
import type { IDESentEvents } from "types";

export const sendUpdateThemeCommand = (theme: string) => {
  const ideAdapter = container.get<IDEPort>(SERVICE_TOKENS.IDEAdapter);
  ideAdapter.sendUpdateThemeMessage(theme);
};

export const sendFetchAnalyzedDataCommand = (selectedBranch?: string) => {
  const ideAdapter = container.get<IDEPort>(SERVICE_TOKENS.IDEAdapter);
  ideAdapter.sendFetchAnalyzedDataMessage(selectedBranch);
};

export const sendRefreshDataCommand = (selectedBranch?: string) => {
  const ideAdapter = container.get<IDEPort>(SERVICE_TOKENS.IDEAdapter);
  ideAdapter.sendRefreshDataMessage(selectedBranch);
  ideAdapter.sendFetchBranchListMessage();
};

export const sendFetchBranchListCommand = () => {
  const ideAdapter = container.get<IDEPort>(SERVICE_TOKENS.IDEAdapter);
  ideAdapter.sendFetchBranchListMessage();
};

export const initializeIDEConnection = (callbacks: IDESentEvents) => {
  const ideAdapter = container.get<IDEPort>(SERVICE_TOKENS.IDEAdapter);
  ideAdapter.addIDESentEventListener(callbacks);
  ideAdapter.sendFetchAnalyzedDataMessage();
  ideAdapter.sendFetchBranchListMessage();
  ideAdapter.sendFetchGithubInfo();
};
