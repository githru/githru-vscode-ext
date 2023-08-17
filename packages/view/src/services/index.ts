import { container } from "tsyringe";

import type IDEPort from "ide/IDEPort";

const ideAdapter = container.resolve<IDEPort>("IDEAdapter");

export const setPrimaryColor = (color: string) => {
  ideAdapter.setPrimaryColor(color);
};

export const sendFetchAnalyzedDataCommand = () => {
  ideAdapter.sendFetchAnalyzedDataMessage();
};
