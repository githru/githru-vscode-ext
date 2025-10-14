import type IDEPort from "ide/IDEPort";
import { FetchDataRequestPayload, RefreshDataRequestPayload } from "types";
import { diContainer } from "container";
import { DI_IDENTIFIERS } from "container/identifiers";
import type { IDESentEvents } from "types";

export const sendUpdateThemeCommand = (theme: string) => {
  const ideAdapter = diContainer.get<IDEPort>(DI_IDENTIFIERS.IDEAdapter);
  ideAdapter.sendUpdateThemeMessage(theme);
};

export const sendFetchAnalyzedDataCommand = (payload: FetchDataRequestPayload) => {
  const ideAdapter = diContainer.get<IDEPort>(DI_IDENTIFIERS.IDEAdapter);
  ideAdapter.sendFetchAnalyzedDataMessage(payload);
};

export const sendRefreshDataCommand = (payload: RefreshDataRequestPayload) => {
  const ideAdapter = diContainer.get<IDEPort>(DI_IDENTIFIERS.IDEAdapter);
  ideAdapter.sendRefreshDataMessage(payload);
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
