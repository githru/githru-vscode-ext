import { forwardRef, useRef, useEffect } from "react";
import {
  IoIosArrowDropdownCircle,
  IoIosArrowDropupCircle,
} from "react-icons/io";

import type { SelectedDataProps } from "types";
import { Detail } from "components";

import { selectedDataUpdater } from "../VerticalClusterList.util";
import type { VerticalClusterListProps } from "../VerticalClusterList.type";

import { AuthorName } from "./AuthorName";
import type { Cluster } from "./Summary.type";
import { getClusterById, getInitData } from "./Summary.util";

import "./Summary.scss";

const Summary = forwardRef<HTMLDivElement, VerticalClusterListProps>(
  ({ data, selectedData, setSelectedData }, ref) => {
    const clusters = getInitData({ data });
    const scrollRef = useRef<HTMLDivElement>(null);

    const getClusterIds = (_selectedData: SelectedDataProps) => {
      if (!_selectedData) return null;
      return _selectedData.commitNodeList[0].clusterId;
    };

    const clusterIds = getClusterIds(selectedData);
    const onClickClusterSummary = (clusterId: number) => {
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
                className="cluster-summary__toggle-contents-button"
                onClick={() => onClickClusterSummary(cluster.clusterId)}
              >
                <div className="cluster-summary__toggle-contents-container">
                  <div className="name-box">
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
                  </div>
                  <div className="cluster-summary__contents">
                    <span className="commit-message">
                      {cluster.summary.content.message}
                    </span>
                    <span className="more-commit-count">
                      {cluster.summary.content.count > 0 &&
                        `+ ${cluster.summary.content.count} more`}
                    </span>
                  </div>
                  <div className="collapsible-icon">
                    {cluster.clusterId === clusterIds ? (
                      <IoIosArrowDropupCircle className="show" />
                    ) : (
                      <IoIosArrowDropdownCircle />
                    )}
                  </div>
                </div>
              </button>
              {cluster.clusterId === clusterIds && (
                <div
                  className="cluster-summary__detail__container"
                  ref={scrollRef}
                >
                  <div ref={ref}>
                    <div className="summary-detail__wrapper">
                      <Detail selectedData={selectedData} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
);

export default Summary;
