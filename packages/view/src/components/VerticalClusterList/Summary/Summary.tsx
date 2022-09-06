import type { GlobalProps } from "types";

import type { Commit, Author, Cluster } from "./Summary.type";
import { getInitData } from "./Summary.util";
import "./Summary.scss";

const Summary = ({ data }: GlobalProps) => {
  const info = getInitData({ data });

  return (
    <div className="entire">
      {info.map((cluster: Cluster) => {
        return (
          <div className="cluster" key={cluster.id}>
            {cluster.commits.map((commit: Commit) => {
              return (
                <p className="commit" key={commit.commitId}>
                  <span className="nameBox">
                    {commit.authorNames.map((authorName: Author) => {
                      return (
                        <span
                          key={authorName.id}
                          className="name"
                          data-tooltip-text={authorName.name}
                        >
                          {authorName.name.slice(0, 1)}
                        </span>
                      );
                    })}
                  </span>
                  <span className="message">{commit.message}</span>
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default Summary;
