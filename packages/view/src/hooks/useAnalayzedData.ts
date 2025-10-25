import { useShallow } from "zustand/react/shallow";

import { useDataStore, useLoadingStore } from "store";
import type { ClusterNode } from "types";

type AnalyzedDataPayload = {
  clusterNodes: ClusterNode[];
  nextCommitId?: string;
  isLastPage: boolean;
  isLoadMore: boolean;
  isPRSuccess: boolean;
};

export const useAnalayzedData = () => {
  const { setData, addData, setFilteredData, setSelectedData, setPagination } = useDataStore(
    useShallow((state) => ({
      setData: state.setData,
      addData: state.addData,
      setFilteredData: state.setFilteredData,
      setSelectedData: state.setSelectedData,
      setPagination: state.setPagination,
    }))
  );
  const { setLoading } = useLoadingStore();

  const handleChangeAnalyzedData = (payload: AnalyzedDataPayload) => {
    if (!payload) {
      setLoading(false);
      return;
    }
    const { clusterNodes, nextCommitId, isLastPage, isLoadMore } = payload;

    // clusterNodes 유효성 검사
    if (!Array.isArray(clusterNodes)) {
      console.error("Invalid clusterNodes:", clusterNodes);
      setLoading(false);
      return;
    }

    if (isLoadMore) {
      addData(clusterNodes);
    } else {
      // first load
      setData(clusterNodes);
      setFilteredData([...clusterNodes]);
    }
    setPagination(isLastPage, nextCommitId);
    setSelectedData([]);
    setLoading(false);
  };

  return { handleChangeAnalyzedData };
};
