import { nanoid } from "nanoid";

import type { GlobalProps } from "types";

import type { Cluster, Keyword } from "./Summary.type";
import { getColorValue, getInitData } from "./Summary.util";

import "./Summary.scss";

const Summary = ({ data }: GlobalProps) => {
  const info = getInitData({ data });

  return (
    <div className="entire">
      {info.map((cluster: Cluster) => {
        const nameBoxId = nanoid();
        const keywordsId = nanoid();

        return (
          <div className="cluster" key={cluster.clusterId}>
            <p className="summary" key={cluster.summary.summaryId}>
              <span className="nameBox" key={nameBoxId}>
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
              <span className="keywords" key={keywordsId}>
                {cluster.summary.keywords.map((keyword: Keyword) => {
                  let size = "";

                  if (keyword.count > 6) size = "large";
                  else if (keyword.count > 3) size = "medium";
                  else size = "small";

                  const keywordId = nanoid();

                  return (
                    <span
                      className={["keyword", size].join(" ")}
                      key={keywordId}
                    >
                      {keyword.keyword}
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
