import React, { forwardRef } from "react";

import type { ClusterNode, SelectedDataProps } from "types";
import { Detail } from "components";

import { selectedDataUpdater } from "../VerticalClusterList.util";

import { AuthorName } from "./AuthorName";
import type { Cluster } from "./Summary.type";
import { getClusterById, getInitData } from "./Summary.util";

import "./Summary.scss";

type SummaryProps = {
  data: ClusterNode[];
  setSelectedData: React.Dispatch<React.SetStateAction<SelectedDataProps>>;
  selectedData: SelectedDataProps;
};

const Summary = forwardRef<HTMLDivElement, SummaryProps>(
  ({ data, selectedData, setSelectedData }, ref) => {
    const clusters = getInitData({ data });

    const getClusterIds = (_selectedData: SelectedDataProps) => {
      if (!_selectedData) return null;
      return _selectedData.commitNodeList[0].clusterId;
    };

    const clusterIds = getClusterIds(selectedData);
    const onClickClusterSummary = (clusterId: number) => {
      const selected = getClusterById(data, clusterId);
      setSelectedData(selectedDataUpdater(selected, clusterId));
    };

    return (
      <div className="summary__entire">
        {clusters.map((cluster: Cluster) => {
          return (
            <React.Fragment key={cluster.clusterId}>
              <div role="presentation" className="cluster">
                <button
                  className="summary"
                  type="button"
                  onClick={() => onClickClusterSummary(cluster.clusterId)}
                >
                  <div className="text-wrapper">
                    <span className="nameBox">
                      {cluster.summary.authorNames.map(
                        (authorArray: Array<string>) => {
                          return authorArray.map((authorName: string) => (
                            <AuthorName
                              key={authorName}
                              authorName={authorName}
                            />
                          ));
                        }
                      )}
                    </span>
                    <span className="contents">
                      {`${cluster.summary.content.message.slice(0, 70)} ${
                        cluster.summary.content.message.length > 70 ? "..." : ""
                      } ${
                        cluster.summary.content.count > 0
                          ? `+ ${cluster.summary.content.count} more`
                          : ""
                      } `}
                    </span>
                  </div>
                  {cluster.clusterId === clusterIds ? (
                    <button className="collapsible-button--shown" type="button">
                      ▲
                    </button>
                  ) : (
                    <button className="collapsible-button" type="button">
                      ▼
                    </button>
                  )}
                </button>
                {cluster.clusterId === clusterIds && (
                  <div className="summary_detail_container" ref={ref}>
                    <Detail selectedData={selectedData} />
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  }
);

export default Summary;
