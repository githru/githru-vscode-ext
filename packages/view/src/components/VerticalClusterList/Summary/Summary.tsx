import { useRef, useEffect } from "react";
import type { ListRowProps } from "react-virtualized";
import { List, AutoSizer } from "react-virtualized";
import { useShallow } from "zustand/react/shallow";

import { Detail } from "components";
import { Author } from "components/Common/Author";
import { useDataStore } from "store";

import "./Summary.scss";
import { ClusterGraph } from "../ClusterGraph";
import { getClusterSizes } from "../ClusterGraph/ClusterGraph.util";
import { CLUSTER_HEIGHT, DETAIL_HEIGHT, NODE_GAP } from "../ClusterGraph/ClusterGraph.const";

import { usePreLoadAuthorImg } from "./Summary.hook";
import { getInitData, getClusterIds, getClusterById, getCommitLatestTag } from "./Summary.util";
import { Content } from "./Content";
import type { ClusterRowProps, SummaryProps } from "./Summary.type";

const COLLAPSED_ROW_HEIGHT = CLUSTER_HEIGHT + NODE_GAP * 2;
const EXPANDED_ROW_HEIGHT = DETAIL_HEIGHT + COLLAPSED_ROW_HEIGHT;

const Summary = ({ onLoadMore, isLoadingMore, enabled, isLastPage }: SummaryProps) => {
  const [filteredData, selectedData, toggleSelectedData] = useDataStore(
    useShallow((state) => [state.filteredData, state.selectedData, state.toggleSelectedData])
  );
  const clusters = getInitData(filteredData);
  const detailRef = useRef<HTMLDivElement>(null);
  const authSrcMap = usePreLoadAuthorImg();
  const selectedClusterIds = getClusterIds(selectedData);
  const listRef = useRef<List>(null);
  const clusterSizes = getClusterSizes(filteredData);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isObservingRef = useRef(false);

  // Create IntersectionObserver once and reuse it
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && enabled) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      isObservingRef.current = false;
    };
  }, [enabled, isLoadingMore, onLoadMore]);

  // Infinite scroll: Observe sentinel when it's rendered
  const handleRowsRendered = ({ stopIndex }: { startIndex: number; stopIndex: number }) => {
    if (isSentinelRow(stopIndex) && sentinelRef.current && enabled && observerRef.current) {
      if (!isObservingRef.current) {
        observerRef.current.observe(sentinelRef.current);
        isObservingRef.current = true;
      }
    }
  };

  // Unobserve when sentinel is no longer needed
  useEffect(() => {
    if (isLastPage && observerRef.current && isObservingRef.current) {
      observerRef.current.disconnect();
      isObservingRef.current = false;
    }
  }, [isLastPage]);

  const isSentinelRow = (index: number) => !isLastPage && index === clusters.length;

  const onClickClusterSummary = (clusterId: number) => () => {
    const selected = getClusterById(filteredData, clusterId);
    toggleSelectedData(selected, clusterId);
  };

  const getRowHeight = ({ index }: { index: number }) => {
    if (isSentinelRow(index)) {
      return 10;
    }

    const cluster = clusters[index];
    return selectedClusterIds.includes(cluster.clusterId) ? EXPANDED_ROW_HEIGHT : COLLAPSED_ROW_HEIGHT;
  };

  const rowRenderer = (props: ListRowProps) => {
    // Render sentinel element
    if (isSentinelRow(props.index)) {
      return (
        <div
          ref={sentinelRef}
          key={props.index}
          style={props.style}
        />
      );
    }

    const cluster = clusters[props.index];
    const isExpanded = selectedClusterIds.includes(cluster.clusterId);
    const { key, ...restProps } = props;

    return (
      <ClusterRow
        key={key}
        {...restProps}
        cluster={cluster}
        isExpanded={isExpanded}
        onClickClusterSummary={onClickClusterSummary}
        authSrcMap={authSrcMap}
        filteredData={filteredData}
        clusterSizes={clusterSizes}
        detailRef={detailRef}
        selectedClusterIds={selectedClusterIds}
      />
    );
  };

  useEffect(() => {
    detailRef.current?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
    if (listRef.current) {
      listRef.current.recomputeRowHeights();
    }
  }, [selectedData]);

  return (
    <div className="vertical-cluster-list__body">
      <AutoSizer>
        {({ width, height }) => (
          <List
            ref={listRef}
            width={width}
            height={height}
            rowCount={isLastPage ? clusters.length : clusters.length + 1}
            rowHeight={getRowHeight}
            rowRenderer={rowRenderer}
            onRowsRendered={handleRowsRendered}
            overscanRowCount={15}
            className="cluster-summary"
          />
        )}
      </AutoSizer>
    </div>
  );
};

export default Summary;

function ClusterRow({
  index,
  style,
  cluster,
  isExpanded,
  onClickClusterSummary,
  authSrcMap,
  filteredData,
  clusterSizes,
  detailRef,
  selectedClusterIds,
}: ClusterRowProps) {
  return (
    <div
      style={style}
      className="cluster-summary__item"
    >
      <div className="cluster-summary__graph">
        <ClusterGraph
          data={[filteredData[index]]}
          clusterSizes={[clusterSizes[index]]}
        />
      </div>
      <div className={`cluster-summary__info${isExpanded ? "--expanded" : ""}`}>
        <button
          type="button"
          className="summary"
          onClick={onClickClusterSummary(cluster.clusterId)}
        >
          <div className="summary__author">
            {authSrcMap &&
              cluster.summary.authorNames.map((authorArray: string[]) => {
                return authorArray.map((authorName: string) => (
                  <Author
                    key={authorName}
                    name={authorName}
                    src={authSrcMap[authorName]}
                  />
                ));
              })}
          </div>
          <div>{getCommitLatestTag(cluster.clusterTags)}</div>
          <Content
            content={cluster.summary.content}
            clusterId={cluster.clusterId}
            selectedClusterIds={selectedClusterIds}
          />
        </button>
        {isExpanded && (
          <div
            className="detail"
            ref={detailRef}
          >
            <Detail
              clusterId={cluster.clusterId}
              authSrcMap={authSrcMap}
            />
          </div>
        )}
      </div>
    </div>
  );
}
