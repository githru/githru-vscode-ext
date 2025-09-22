import type IDEPort from "ide/IDEPort";

import { container } from "../container";

export const sendUpdateThemeCommand = (theme: string) => {
  const ideAdapter = container.get<IDEPort>("IDEAdapter");
  ideAdapter.sendUpdateThemeMessage(theme);
};

export const sendFetchAnalyzedDataCommand = (selectedBranch?: string) => {
  const ideAdapter = container.get<IDEPort>("IDEAdapter");
  ideAdapter.sendFetchAnalyzedDataMessage(selectedBranch);
};

export const sendRefreshDataCommand = (selectedBranch?: string) => {
  const ideAdapter = container.get<IDEPort>("IDEAdapter");
  ideAdapter.sendRefreshDataMessage(selectedBranch);
  ideAdapter.sendFetchBranchListMessage();
};

export const sendFetchBranchListCommand = () => {
  const ideAdapter = container.get<IDEPort>("IDEAdapter");
  ideAdapter.sendFetchBranchListMessage();
};
