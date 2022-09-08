import React from "react";

import type { ClusterNode, SelectedDataProps } from "types";

import { selectedDataUpdater } from "../VerticalClusterList.util";

import type { Cluster, Keyword } from "./Summary.type";
import { getClusterById, getColorValue, getInitData } from "./Summary.util";

import "./Summary.scss";

type SummaryProps = {
  data: ClusterNode[];
  setSelectedData: React.Dispatch<React.SetStateAction<SelectedDataProps>>;
};

const Summary = ({ data, setSelectedData }: SummaryProps) => {
  const clusters = getInitData({ data });

  const onClickClusterSummary = (clusterId: number) => () => {
    const selected = getClusterById(data, clusterId);
    setSelectedData(selectedDataUpdater(selected, clusterId));
  };

  return (
    <div className="entire">
      {clusters.map((cluster: Cluster) => {
        return (
          <div
            role="presentation"
            className="cluster"
            key={cluster.clusterId}
            onClick={onClickClusterSummary(cluster.clusterId)}
          >
            <p className="summary">
              <span className="nameBox">
                {cluster.summary.authorNames.map(
                  (authorArray: Array<string>) => {
                    return authorArray.map((authorName: string) => {
                      const colorValue = getColorValue(authorName);
                      return (
                        <span
                          key={authorName}
                          className={["name"].join(" ")}
                          data-tooltip-text={authorName}
                          style={{ backgroundColor: colorValue }}
                        >
                          {authorName.slice(0, 1)}
                        </span>
                      );
                    });
                  }
                )}
              </span>
              <span className="keywords">
                {cluster.summary.keywords.map((keywordObj: Keyword) => {
                  let size = "";

                  if (keywordObj.count > 6) size = "large";
                  else if (keywordObj.count > 3) size = "medium";
                  else size = "small";

                  return (
                    <span
                      className={["keyword", size].join(" ")}
                      key={keywordObj.keyword}
                    >
                      {keywordObj.keyword}
                    </span>
                  );
                })}
              </span>
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default Summary;
