import React from "react";

import type { ClusterNode, SelectedDataProps } from "types";
import { Detail } from "components";

import { selectedDataUpdater } from "../VerticalClusterList.util";

import { AuthorName } from "./AuthorName";
import type { Cluster, Keyword } from "./Summary.type";
import { getClusterById, getInitData } from "./Summary.util";

import "./Summary.scss";

type SummaryProps = {
  data: ClusterNode[];
  setSelectedData: React.Dispatch<React.SetStateAction<SelectedDataProps>>;
  selectedData: SelectedDataProps;
};

const Summary = ({ data, selectedData, setSelectedData }: SummaryProps) => {
  const clusters = getInitData({ data });

  const getClusterIds = (_selectedData: SelectedDataProps) => {
    if (!_selectedData) return null;
    return _selectedData.commitNodeList[0].clusterId;
  };

  const clusterIds = getClusterIds(selectedData);
  const onClickClusterSummary = (clusterId: number) => () => {
    const selected = getClusterById(data, clusterId);
    setSelectedData(selectedDataUpdater(selected, clusterId));
  };

  return (
    <div className="summary__entire">
      {clusters.map((cluster: Cluster) => {
        return (
          <React.Fragment key={cluster.clusterId}>
            <div
              role="presentation"
              className="cluster"
              onClick={onClickClusterSummary(cluster.clusterId)}
            >
              <p className="summary">
                <span className="nameBox">
                  {cluster.summary.authorNames.map(
                    (authorArray: Array<string>) => {
                      return authorArray.map((authorName: string) => (
                        <AuthorName key={authorName} authorName={authorName} />
                      ));
                    }
                  )}
                </span>
                <span className="keywords">
                  {cluster.summary.keywords.map((keywordObj: Keyword) => {
                    let size = "small";
                    if (keywordObj.count > 3) size = "medium";
                    if (keywordObj.count > 6) size = "large";

                    return (
                      <span
                        key={`${cluster.clusterId}-${keywordObj.keyword}`}
                        className={["keyword", size].join(" ")}
                      >
                        {keywordObj.keyword}
                      </span>
                    );
                  })}
                </span>
              </p>
            </div>
            {cluster.clusterId === clusterIds && (
              <div className="summary_detail_container">
                <Detail selectedData={selectedData} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Summary;
