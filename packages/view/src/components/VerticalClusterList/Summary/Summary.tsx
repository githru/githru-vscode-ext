import type { GlobalProps } from "types";

import type { Cluster, Keyword } from "./Summary.type";
import { getColorValue, getInitData } from "./Summary.util";

import "./Summary.scss";

const Summary = ({ data }: GlobalProps) => {
  const clusters = getInitData({ data });

  return (
    <div className="entire">
      {clusters.map((cluster: Cluster) => {
        return (
          <div className="cluster" key={cluster.clusterId}>
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
