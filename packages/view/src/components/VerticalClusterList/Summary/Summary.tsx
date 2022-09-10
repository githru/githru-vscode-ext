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
                      // const colorValue = getColorValue(authorName);
                      // return (
                      //   <span
                      //     key={authorName}
                      //     className={["name"].join(" ")}
                      //     data-tooltip-text={authorName}
                      //     style={{ backgroundColor: colorValue }}
                      //   >
                      //     {authorName.slice(0, 1)}
                      //   </span>
                      // );
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
              <div
                style={{ height: "280px", marginTop: "20px", overflow: "auto" }}
              >
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
