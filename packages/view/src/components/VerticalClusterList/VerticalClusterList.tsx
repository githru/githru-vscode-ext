import { useCallback, useEffect, useState } from "react";

import { useDataStore, useLoadingStore } from "store";
import { FilteredAuthors } from "components/FilteredAuthors";
import { SelectedClusterGroup } from "components/SelectedClusterGroup";
import { sendFetchAnalyzedDataCommand } from "services";
import { COMMIT_COUNT_PER_PAGE } from "constants/constants";

import { Summary } from "./Summary";

import "./VerticalClusterList.scss";

const VerticalClusterList = () => {
  const selectedData = useDataStore((state) => state.selectedData);
  const { filteredData, nextCommitId, isLastPage } = useDataStore((state) => ({
    filteredData: state.filteredData,
    nextCommitId: state.nextCommitId,
    isLastPage: state.isLastPage,
  }));

  const { loading } = useLoadingStore();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || isLastPage) return;

    setIsLoadingMore(true);
    sendFetchAnalyzedDataCommand({
      commitCountPerPage: COMMIT_COUNT_PER_PAGE,
      lastCommitId: nextCommitId,
    });
  }, [isLoadingMore, isLastPage, nextCommitId]);

  useEffect(() => {
    if (!loading && isLoadingMore) {
      setIsLoadingMore(false);
    }
  }, [loading, isLoadingMore]);

  return (
    <div className="vertical-cluster-list">
      {selectedData.length > 0 && (
        <div className="vertical-cluster-list__header">
          <FilteredAuthors />
          <SelectedClusterGroup />
        </div>
      )}
      <Summary
        onLoadMore={handleLoadMore}
        isLoadingMore={isLoadingMore}
        isLastPage={isLastPage}
        enabled={!isLastPage && !isLoadingMore && filteredData.length > 0}
      />
    </div>
  );
};

export default VerticalClusterList;
