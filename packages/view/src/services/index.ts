import { container } from "tsyringe";

import type IDEPort from "ide/IDEPort";

export const setPrimaryColor = (color: string) => {
  const ideAdapter = container.resolve<IDEPort>("IDEAdapter");
  ideAdapter.setPrimaryColor(color);
};

export const sendFetchAnalyzedDataCommand = () => {
  const ideAdapter = container.resolve<IDEPort>("IDEAdapter");
  ideAdapter.sendFetchAnalyzedDataMessage();
};

export const sendRefreshDataCommand = () => {
  const ideAdapter = container.resolve<IDEPort>("IDEAdapter");
  ideAdapter.sendRefreshDataMessage();
};
