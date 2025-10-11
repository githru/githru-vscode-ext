import type IDEPort from "ide/IDEPort";
import { diContainer } from "container";
import { DI_IDENTIFIERS } from "container/identifiers";
import type { IDESentEvents } from "types";

export const sendUpdateThemeCommand = (theme: string) => {
  const ideAdapter = diContainer.get<IDEPort>(DI_IDENTIFIERS.IDEAdapter);
  ideAdapter.sendUpdateThemeMessage(theme);
};

export const sendFetchAnalyzedDataCommand = (selectedBranch?: string) => {
  const ideAdapter = diContainer.get<IDEPort>(DI_IDENTIFIERS.IDEAdapter);
  ideAdapter.sendFetchAnalyzedDataMessage(selectedBranch);
};

export const sendRefreshDataCommand = (selectedBranch?: string) => {
  const ideAdapter = diContainer.get<IDEPort>(DI_IDENTIFIERS.IDEAdapter);
  ideAdapter.sendRefreshDataMessage(selectedBranch);
  ideAdapter.sendFetchBranchListMessage();
};

export const sendFetchBranchListCommand = () => {
  const ideAdapter = diContainer.get<IDEPort>(DI_IDENTIFIERS.IDEAdapter);
  ideAdapter.sendFetchBranchListMessage();
};

export const initializeIDEConnection = (callbacks: IDESentEvents) => {
  const ideAdapter = diContainer.get<IDEPort>(DI_IDENTIFIERS.IDEAdapter);
  ideAdapter.addIDESentEventListener(callbacks);
  ideAdapter.sendFetchAnalyzedDataMessage();
  ideAdapter.sendFetchBranchListMessage();
  ideAdapter.sendFetchGithubInfo();
};
