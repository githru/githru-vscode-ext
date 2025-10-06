import { container } from "tsyringe";

import type IDEPort from "ide/IDEPort";

export const sendUpdateThemeCommand = (theme: string) => {
  const ideAdapter = container.resolve<IDEPort>("IDEAdapter");
  ideAdapter.sendUpdateThemeMessage(theme);
};

export const sendFetchAnalyzedDataCommand = (selectedBranch?: string) => {
  const ideAdapter = container.resolve<IDEPort>("IDEAdapter");
  ideAdapter.sendFetchAnalyzedDataMessage({ baseBranch: selectedBranch });
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
