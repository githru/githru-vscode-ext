import { useShallow } from "zustand/react/shallow";

import { useDataStore } from "store";

export const useGetSelectedData = () => {
  const [filteredData, selectedData] = useDataStore(useShallow((state) => [state.filteredData, state.selectedData]));
  return selectedData.length ? selectedData : filteredData;
};
