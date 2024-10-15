import { container } from "tsyringe";

import type IDEPort from "ide/IDEPort";

export const setCustomTheme = (color: string) => {
  const ideAdapter = container.resolve<IDEPort>("IDEAdapter");
  ideAdapter.setCustomTheme(color);
};

export const sendFetchAnalyzedDataCommand = (selectedBranch?: string) => {
  const ideAdapter = container.resolve<IDEPort>("IDEAdapter");
  ideAdapter.sendFetchAnalyzedDataMessage(selectedBranch);
};

export const sendRefreshDataCommand = (selectedBranch?: string) => {
  const ideAdapter = container.resolve<IDEPort>("IDEAdapter");
  ideAdapter.sendRefreshDataMessage(selectedBranch);
  ideAdapter.sendFetchBranchListMessage();
};

export const sendFetchBranchListCommand = () => {
  const ideAdapter = container.resolve<IDEPort>("IDEAdapter");
  ideAdapter.sendFetchBranchListMessage();
};
