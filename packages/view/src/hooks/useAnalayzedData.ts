import { useShallow } from "zustand/react/shallow";

import { useDataStore, useLoadingStore } from "store";
import type { ClusterNode } from "types";

export const useAnalayzedData = () => {
  const [setData, setFilteredData, setSelectedData] = useDataStore(
    useShallow((state) => [state.setData, state.setFilteredData, state.setSelectedData])
  );
  const { setLoading } = useLoadingStore();

  const handleChangeAnalyzedData = (analyzedData: ClusterNode[]) => {
    setData(analyzedData);
    setFilteredData([...analyzedData.reverse()]);
    setSelectedData([]);
    setLoading(false);
  };

  return { handleChangeAnalyzedData };
};
