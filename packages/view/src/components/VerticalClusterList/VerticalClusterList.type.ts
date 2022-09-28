import type React from "react";

import type { GlobalProps, SelectedDataProps } from "types";

export type VerticalClusterListProps = GlobalProps & {
  selectedData: SelectedDataProps;
  setSelectedData: React.Dispatch<React.SetStateAction<SelectedDataProps>>;
};
