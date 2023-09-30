import { useRef, useEffect } from "react";
import classNames from "classnames/bind";

import type { ClusterNode } from "types";
import { Detail } from "components";
import { useGlobalData } from "hooks";

import { Author } from "../../@common/Author";
import { selectedDataUpdater } from "../VerticalClusterList.util";

import { usePreLoadAuthorImg } from "./Summary.hook";
import { getInitData, getClusterIds, getClusterById } from "./Summary.util";
import { Content } from "./Content";
import type { Cluster } from "./Summary.type";
import styles from "./Summary.module.scss";

const Summary = () => {
  const cx = classNames.bind(styles);
  const { filteredData: data, selectedData, setSelectedData } = useGlobalData();
  const clusters = getInitData(data);
  const detailRef = useRef<HTMLDivElement>(null);
  const authSrcMap = usePreLoadAuthorImg();
  const selectedClusterId = getClusterIds(selectedData);
  const onClickClusterSummary = (clusterId: number) => () => {
    const selected = getClusterById(data, clusterId);
    setSelectedData((prevState: ClusterNode[]) => selectedDataUpdater(selected, clusterId)(prevState));
  };

  useEffect(() => {
    detailRef.current?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }, [selectedData]);
  return (
    <div className={cx("cluster-summary__container")}>
      {clusters.map((cluster: Cluster) => {
        return (
          <div
            className={cx("cluster-summary__cluster")}
            role="presentation"
            key={cluster.clusterId}
          >
            <button
              className={cx("toggle-contents-button")}
              type="button"
              onClick={onClickClusterSummary(cluster.clusterId)}
            >
              <div className={cx("toggle-contents-container")}>
                <div className={cx("name-box")}>
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
              <div
                className={cx("detail__container")}
                ref={detailRef}
              >
                <Detail
                  selectedData={selectedData}
                  clusterId={cluster.clusterId}
                  authSrcMap={authSrcMap}
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
