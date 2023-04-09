import { useRef, useEffect } from "react";

import { Detail } from "components";
import { useGlobalData } from "hooks";

import { selectedDataUpdater } from "../VerticalClusterList.util";

import "./Summary.scss";
import { usePreLoadAuthorImg } from "./Summary.hook";
import { getInitData, getClusterIds, getClusterById } from "./Summary.util";
import { Content } from "./Content";
import { Author } from "./Author";
import type { Cluster } from "./Summary.type";

const Summary = () => {
  const { filteredData: data, selectedData, setSelectedData } = useGlobalData();
  const clusters = getInitData(data);
  const scrollRef = useRef<HTMLDivElement>(null);
  const authSrcMap = usePreLoadAuthorImg();
  const selectedClusterId = getClusterIds(selectedData);
  const onClickClusterSummary = (clusterId: number) => () => {
    const selected = getClusterById(data, clusterId);
    setSelectedData(selectedDataUpdater(selected, clusterId));
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }, [selectedData]);

  return (
    <div className="cluster-summary__container">
      {clusters.map((cluster: Cluster) => {
        return (
          <div
            role="presentation"
            className="cluster-summary__cluster"
            key={cluster.clusterId}
          >
            <button
              type="button"
              className="toggle-contents-button"
              onClick={onClickClusterSummary(cluster.clusterId)}
            >
              <div className="toggle-contents-container">
                <div className="name-box">
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
                <Content
                  content={cluster.summary.content}
                  clusterId={cluster.clusterId}
                  selectedClusterId={selectedClusterId}
                />
              </div>
            </button>
            {selectedClusterId.includes(cluster.clusterId) && (
              <div className="detail__container" ref={scrollRef}>
                <Detail
                  selectedData={selectedData}
                  clusterId={cluster.clusterId}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Summary;
