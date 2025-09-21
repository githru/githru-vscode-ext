import { useRef, useEffect, useCallback } from "react";
import type { ListRowProps } from "react-virtualized";
import { List, AutoSizer } from "react-virtualized";
import { useShallow } from "zustand/react/shallow";

import type { ClusterNode } from "types";
import { Detail } from "components";
import { useDataStore, useSelectedClusterStore } from "store";

import "./Summary.scss";
import { Author } from "../../@common/Author";
import { selectedDataUpdater } from "../VerticalClusterList.util";
import { ClusterGraph } from "../ClusterGraph";

import { usePreLoadAuthorImg } from "./Summary.hook";
import { getInitData, getClusterById, getCommitLatestTag } from "./Summary.util";
import { Content } from "./Content";
import type { ClusterRowProps } from "./Summary.type";

const Summary = () => {
  const [filteredData, setSelectedData] = useDataStore(
    useShallow((state) => [state.filteredData, state.setSelectedData])
  );
  const clusters = getInitData(filteredData);
  const detailRef = useRef<HTMLDivElement>(null);
  const authSrcMap = usePreLoadAuthorImg();
  const listRef = useRef<List>(null);
  const { setDetailRef } = useSelectedClusterStore();

  const onClickClusterSummary = useCallback(
    (clusterId: number) => () => {
      const selected = getClusterById(filteredData, clusterId);
      setSelectedData((prevState: ClusterNode[]) => {
        return selectedDataUpdater(selected, clusterId)(prevState);
      });
      useSelectedClusterStore.getState().toggleCluster(clusterId);
    },
    [filteredData, setSelectedData]
  );

  const getRowHeight = useCallback(
    ({ index }: { index: number }) => {
      const cluster = clusters[index];
      return useSelectedClusterStore.getState().getRowHeight(cluster.clusterId);
    },
    [clusters]
  );

  const rowRenderer = useCallback(
    (props: ListRowProps) => {
      const cluster = clusters[props.index];

      return (
        <ClusterRow
          {...props}
          cluster={cluster}
          onClickClusterSummary={onClickClusterSummary}
          authSrcMap={authSrcMap}
        />
      );
    },
    [clusters, onClickClusterSummary, authSrcMap]
  );

  useEffect(() => {
    setDetailRef(detailRef.current);
  }, [setDetailRef]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.recomputeRowHeights();
    }
  }, [listRef]);

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

function ClusterRow({ index, key, style, cluster, onClickClusterSummary, authSrcMap }: ClusterRowProps) {
  const isExpanded = useSelectedClusterStore((state) => state.isExpanded(cluster.clusterId));
  const setDetailRef = useSelectedClusterStore((state) => state.setDetailRef);

  return (
    <div
      key={key}
      style={style}
      className="cluster-summary__item"
    >
      <div className="cluster-summary__graph">
        <ClusterGraph index={index} />
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
            isExpanded={isExpanded}
          />
        </button>
        {isExpanded && (
          <div
            className="detail"
            ref={(ref) => {
              if (ref) {
                setDetailRef(ref);
              }
            }}
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
