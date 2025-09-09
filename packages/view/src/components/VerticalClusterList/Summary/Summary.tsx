import React, { useRef, useEffect, useMemo, useCallback, memo } from "react";
import type { ListRowProps } from "react-virtualized";
import { List, AutoSizer } from "react-virtualized";
import { useShallow } from "zustand/react/shallow";

import type { ClusterNode } from "types";
import { Detail } from "components";
import { useDataStore } from "store";

import "./Summary.scss";
import { Author } from "../../@common/Author";
import { selectedDataUpdater } from "../VerticalClusterList.util";
import { ClusterGraph } from "../ClusterGraph";
import { getClusterSizes } from "../ClusterGraph/ClusterGraph.util";
import { CLUSTER_HEIGHT, DETAIL_HEIGHT, NODE_GAP } from "../ClusterGraph/ClusterGraph.const";

import type { Cluster, AuthSrcMap } from "./Summary.type";
import { usePreLoadAuthorImg } from "./Summary.hook";
import { getInitData, getClusterIds, getClusterById, getCommitLatestTag } from "./Summary.util";
import { Content } from "./Content";

const COLLAPSED_ROW_HEIGHT = CLUSTER_HEIGHT + NODE_GAP * 2;
const EXPANDED_ROW_HEIGHT = DETAIL_HEIGHT + COLLAPSED_ROW_HEIGHT;

type ClusterRowProps = {
  cluster: Cluster;
  isExpanded: boolean;
  filteredData: ClusterNode[];
  clusterSizes: number[];
  authSrcMap: AuthSrcMap | null;
  selectedData: ClusterNode[];
  selectedClusterIds: number[];
  onClickClusterSummary: (clusterId: number) => () => void;
  detailRef: React.RefObject<HTMLDivElement>;
  isLastClicked: boolean;
  style: React.CSSProperties;
  index: number;
};

const ClusterRow = memo(
  ({
    cluster,
    isExpanded,
    filteredData,
    clusterSizes,
    authSrcMap,
    selectedData,
    selectedClusterIds,
    onClickClusterSummary,
    detailRef,
    isLastClicked,
    style,
    index,
  }: ClusterRowProps) => (
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
            ref={isLastClicked ? detailRef : null}
          >
            <Detail
              selectedData={selectedData}
              clusterId={cluster.clusterId}
              authSrcMap={authSrcMap}
            />
          </div>
        )}
      </div>
    </div>
  )
);

const Summary = () => {
  const [filteredData, selectedData, setSelectedData] = useDataStore(
    useShallow((state) => [state.filteredData, state.selectedData, state.setSelectedData])
  );

  const authSrcMap = usePreLoadAuthorImg();

  const clusters = useMemo(() => getInitData(filteredData), [filteredData]);
  const selectedClusterIds = useMemo(() => getClusterIds(selectedData), [selectedData]);
  const clusterSizes = useMemo(() => getClusterSizes(filteredData), [filteredData]);

  const listRef = useRef<List>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const lastClickedClusterIdRef = useRef<number | null>(null);

  const onClickClusterSummary = useCallback(
    (clusterId: number) => () => {
      lastClickedClusterIdRef.current = clusterId;
      const selected = getClusterById(filteredData, clusterId);
      setSelectedData((prevState: ClusterNode[]) => {
        return selectedDataUpdater(selected, clusterId)(prevState);
      });
      if (listRef.current) {
        listRef.current.forceUpdateGrid();
      }
    },
    [filteredData, setSelectedData]
  );

  useEffect(() => {
    if (listRef.current) {
      listRef.current.recomputeRowHeights();
    }
  }, [selectedData]);

  useEffect(() => {
    // 클릭한 클러스터의 detail 요소로 스크롤
    if (lastClickedClusterIdRef.current && detailRef.current) {
      setTimeout(() => {
        detailRef.current?.scrollIntoView({
          block: "center",
          behavior: "smooth",
        });
      }, 100);
    }
  }, [selectedData]);

  const getRowHeight = useCallback(
    ({ index }: { index: number }) => {
      const cluster = clusters[index];
      return selectedClusterIds.includes(cluster.clusterId) ? EXPANDED_ROW_HEIGHT : COLLAPSED_ROW_HEIGHT;
    },
    [clusters, selectedClusterIds]
  );

  const rowRenderer = useCallback(
    ({ index, key, style }: ListRowProps) => {
      const cluster = clusters[index];
      const isExpanded = selectedClusterIds.includes(cluster.clusterId);
      const isLastClicked = cluster.clusterId === lastClickedClusterIdRef.current;

      return (
        <ClusterRow
          key={key}
          cluster={cluster}
          isExpanded={isExpanded}
          filteredData={filteredData}
          clusterSizes={clusterSizes}
          authSrcMap={authSrcMap}
          selectedData={selectedData}
          selectedClusterIds={selectedClusterIds}
          onClickClusterSummary={onClickClusterSummary}
          detailRef={detailRef}
          isLastClicked={isLastClicked}
          style={style}
          index={index}
        />
      );
    },
    [
      clusters,
      selectedClusterIds,
      filteredData,
      clusterSizes,
      authSrcMap,
      selectedData,
      onClickClusterSummary,
      detailRef,
    ]
  );

  return (
    <div className="vertical-cluster-list__body">
      <AutoSizer>
        {({ width, height }) => (
          <List
            ref={listRef}
            width={width}
            height={height}
            rowCount={clusters.length}
            rowHeight={getRowHeight}
            rowRenderer={rowRenderer}
            overscanRowCount={15}
            className="cluster-summary"
          />
        )}
      </AutoSizer>
    </div>
  );
};

export default Summary;
