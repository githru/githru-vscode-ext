import { container } from "tsyringe";

import type IDEPort from "ide/IDEPort";
import { FetchDataRequestPayload, RefreshDataRequestPayload } from "types";

export const sendUpdateThemeCommand = (theme: string) => {
  const ideAdapter = container.resolve<IDEPort>("IDEAdapter");
  ideAdapter.sendUpdateThemeMessage(theme);
};

export const sendFetchAnalyzedDataCommand = (payload: FetchDataRequestPayload) => {
  const ideAdapter = container.resolve<IDEPort>("IDEAdapter");
  ideAdapter.sendFetchAnalyzedDataMessage(payload);
};

export const sendRefreshDataCommand = (payload: RefreshDataRequestPayload) => {
  const ideAdapter = container.resolve<IDEPort>("IDEAdapter");
  ideAdapter.sendRefreshDataMessage(payload);
  ideAdapter.sendFetchBranchListMessage();
};

export const sendFetchBranchListCommand = () => {
  const ideAdapter = container.resolve<IDEPort>("IDEAdapter");
  ideAdapter.sendFetchBranchListMessage();
};
