import { useDataStore, useLoadingStore } from "store";
import type { ClusterNode } from "types";

export const useAnalayzedData = () => {
  const { setData, setFilteredData, setSelectedData } = useDataStore();
  const { setLoading } = useLoadingStore();

  const handleChangeAnalyzedData = (analyzedData: ClusterNode[]) => {
    setData(analyzedData);
    setFilteredData([...analyzedData.reverse()]);
    setSelectedData([]);
    setLoading(false);
  };

  return { handleChangeAnalyzedData };
};
