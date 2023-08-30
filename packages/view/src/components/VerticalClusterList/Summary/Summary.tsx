import { useRef, useEffect, useState } from "react";
import { TbSortAscending, TbSortDescending } from "react-icons/tb";

import type { ClusterNode } from "types";
import { Detail } from "components";
import { useGlobalData } from "hooks";

import "./Summary.scss";
import { Author } from "../../@common/Author";
import { selectedDataUpdater } from "../VerticalClusterList.util";

import { usePreLoadAuthorImg } from "./Summary.hook";
import { getClusterIds, getClusterById, getInitData } from "./Summary.util";
import { Content } from "./Content";
import type { Cluster } from "./Summary.type";

const Summary = () => {
  const { filteredData: data, selectedData, setSelectedData } = useGlobalData();
  const [isAscSorted, setIsAscSorted] = useState<boolean>(false);
  const [clusters, setClusters] = useState<Cluster[]>(getInitData(data));
  const detailRef = useRef<HTMLDivElement>(null);
  const authSrcMap = usePreLoadAuthorImg();
  const selectedClusterId = getClusterIds(selectedData);
  const onClickClusterSummary = (clusterId: number) => () => {
    const selected = getClusterById(data, clusterId);
    setSelectedData((prevState: ClusterNode[]) => selectedDataUpdater(selected, clusterId)(prevState));
  };

  // 오름차순 정렬
  const handleClickAscSort = () => {
    setClusters([...clusters].sort((a, b) => Number(new Date(a.createdAt)) - Number(new Date(b.createdAt))));
    setIsAscSorted(true);
  };

  // 내림차순 정렬
  const handleClickDescSort = () => {
    setClusters([...clusters].sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))));
    setIsAscSorted(false);
  };

  useEffect(() => {
    detailRef.current?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }, [selectedData]);

  return (
    <>
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
                <div
                  className="detail__container"
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
      {isAscSorted ? (
        <TbSortAscending
          className="sort-button"
          size={30}
          onClick={handleClickDescSort}
        />
      ) : (
        <TbSortDescending
          className="sort-button"
          size={30}
          onClick={handleClickAscSort}
        />
      )}
    </>
  );
};

export default Summary;
