import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useDataStore } from "store";

import type { FolderActivity } from "./FolderActivityFlow.analyzer";
import { DIMENSIONS } from "./FolderActivityFlow.const";
import type { ReleaseGroup } from "./FolderActivityFlow.releaseAnalyzer";
import "./FolderActivityFlow.scss";
import { extractContributorActivities, extractReleaseBasedContributorActivities } from "./FolderActivityFlow.util";
import { renderClusterVisualization } from "./ClusterVisualization";
import { renderReleaseVisualization } from "./ReleaseVisualization";
import { ClusterModeStrategy, ReleaseModeStrategy, type NavigationStrategy } from "./NavigationStrategy";

const FolderActivityFlow = () => {
  const [totalData] = useDataStore(useShallow((state) => [state.data]));

  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [topFolders, setTopFolders] = useState<FolderActivity[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [folderDepth, setFolderDepth] = useState<number>(1);

  // 릴리즈 모드 관련 state
  const [isReleaseMode, setIsReleaseMode] = useState<boolean>(false);
  const [releaseGroups, setReleaseGroups] = useState<ReleaseGroup[]>([]);
  const [releaseTopFolderPaths, setReleaseTopFolderPaths] = useState<string[]>([]);

  // Navigation Strategy
  const navigationStrategy: NavigationStrategy = isReleaseMode
    ? new ReleaseModeStrategy()
    : new ClusterModeStrategy();

  // 릴리즈 모드 토글 핸들러
  const handleModeToggle = () => {
    setIsReleaseMode(!isReleaseMode);
    setCurrentPath("");
    setFolderDepth(1);
  };

  // 폴더 클릭 처리
  const handleFolderClick = (folderPath: string) => {
    if (folderPath === ".") {
      return;
    }

    const subFolders = navigationStrategy.getSubFolders(totalData, folderPath);

    if (subFolders.length > 0) {
      setCurrentPath(folderPath);
      setFolderDepth(folderDepth + 1);

      if (isReleaseMode) {
        setReleaseTopFolderPaths(subFolders as string[]);
      } else {
        setTopFolders(subFolders as FolderActivity[]);
      }
    }
  };

  // 상위 폴더로 이동
  const handleGoUp = () => {
    if (currentPath === "") {
      return;
    }

    const parentPath = currentPath.includes("/") ? currentPath.substring(0, currentPath.lastIndexOf("/")) : "";

    if (parentPath === "") {
      setCurrentPath("");
      setFolderDepth(1);

      const rootResult = navigationStrategy.getRootFolders(totalData);
      if (isReleaseMode) {
        setReleaseTopFolderPaths(rootResult.folders as string[]);
        if (rootResult.releaseGroups) {
          setReleaseGroups(rootResult.releaseGroups);
        }
      } else {
        setTopFolders(rootResult.folders as FolderActivity[]);
      }
    } else {
      setCurrentPath(parentPath);
      setFolderDepth(Math.max(1, folderDepth - 1));

      const subFolders = navigationStrategy.getSubFolders(totalData, parentPath);
      if (isReleaseMode) {
        setReleaseTopFolderPaths(subFolders as string[]);
      } else {
        setTopFolders(subFolders as FolderActivity[]);
      }
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      setCurrentPath("");
      setFolderDepth(1);

      const rootResult = navigationStrategy.getRootFolders(totalData);
      if (isReleaseMode) {
        setReleaseTopFolderPaths(rootResult.folders as string[]);
        if (rootResult.releaseGroups) {
          setReleaseGroups(rootResult.releaseGroups);
        }
      } else {
        setTopFolders(rootResult.folders as FolderActivity[]);
      }
    } else if (index < getBreadcrumbs().length - 1) {
      const pathParts = currentPath.split("/");
      const targetPath = pathParts.slice(0, index).join("/");
      setCurrentPath(targetPath);
      setFolderDepth(index + 1);

      const subFolders = navigationStrategy.getSubFolders(totalData, targetPath);
      if (isReleaseMode) {
        setReleaseTopFolderPaths(subFolders as string[]);
      } else {
        setTopFolders(subFolders as FolderActivity[]);
      }
    }
  };

  useEffect(() => {
    if (!totalData || totalData.length === 0) {
      return;
    }

    if (currentPath === "") {
      const clusterStrategy = new ClusterModeStrategy();
      const releaseStrategy = new ReleaseModeStrategy();

      const clusterResult = clusterStrategy.getRootFolders(totalData);
      setTopFolders(clusterResult.folders as FolderActivity[]);

      const releaseResult = releaseStrategy.getRootFolders(totalData);
      setReleaseTopFolderPaths(releaseResult.folders as string[]);
      if (releaseResult.releaseGroups) {
        setReleaseGroups(releaseResult.releaseGroups);
      }
    }
  }, [totalData]);

  useEffect(() => {
    if (!totalData || totalData.length === 0) {
      return;
    }

    if (isReleaseMode) {
      if (releaseGroups.length === 0 || releaseTopFolderPaths.length === 0) {
        return;
      }
    } else if (topFolders.length === 0) {
      return;
    }

    const svg = d3.select(svgRef.current).attr("width", DIMENSIONS.width).attr("height", DIMENSIONS.height);

    svg.selectAll("*").remove();

    if (isReleaseMode) {
      const currentDepth = currentPath === "" ? 1 : currentPath.split("/").length + 1;
      const releaseContributorActivities = extractReleaseBasedContributorActivities(
        totalData,
        releaseTopFolderPaths,
        currentDepth
      );

      if (releaseContributorActivities.length === 0) {
        svg
          .append("text")
          .attr("x", DIMENSIONS.width / 2)
          .attr("y", DIMENSIONS.height / 2)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .text("No release activity data available")
          .style("font-size", "14px")
          .style("fill", "#6c757d");
        return;
      }

      renderReleaseVisualization({
        svg,
        releaseContributorActivities,
        releaseTopFolderPaths,
        tooltipRef,
        onFolderClick: handleFolderClick,
      });
    } else {
      const contributorActivities = extractContributorActivities(totalData, topFolders, currentPath);

      if (contributorActivities.length === 0) {
        svg
          .append("text")
          .attr("x", DIMENSIONS.width / 2)
          .attr("y", DIMENSIONS.height / 2)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .text("No activity data available for this folder")
          .style("font-size", "14px")
          .style("fill", "#6c757d");
        return;
      }

      renderClusterVisualization({
        svg,
        contributorActivities,
        topFolders,
        tooltipRef,
        onFolderClick: handleFolderClick,
      });
    }
  }, [totalData, topFolders, isReleaseMode, releaseGroups, releaseTopFolderPaths]);

  // 브레드크럼 생성
  const getBreadcrumbs = () => {
    if (currentPath === "") {
      return ["root"];
    }

    const parts = currentPath.split("/");
    const breadcrumbs = ["root"];
    let current = "";

    parts.forEach((part) => {
      current = current ? `${current}/${part}` : part;
      breadcrumbs.push(part);
    });

    return breadcrumbs;
  };

  return (
    <div className="folder-activity-flow">
      <div className="folder-activity-flow__header">
        <div>
          <p className="folder-activity-flow__title">Contributors Folder Activity Flow</p>
          <div className="folder-activity-flow__subtitle">
            {isReleaseMode
              ? "Contributors moving between folders across releases"
              : "Contributors moving between top folders over time"}
          </div>
        </div>
        <button
          className="folder-activity-flow__mode-toggle"
          onClick={handleModeToggle}
          style={{
            padding: "8px 16px",
            backgroundColor: isReleaseMode ? "#28a745" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          {isReleaseMode ? "📋 Release Mode" : "🔗 Cluster Mode"}
        </button>
      </div>

      <div className="folder-activity-flow__breadcrumb">
        {getBreadcrumbs().map((crumb, index) => (
          <span key={crumb}>
            {index > 0 && <span className="separator"> / </span>}
            <span
              className={index === getBreadcrumbs().length - 1 ? "current" : "clickable"}
              onClick={() => handleBreadcrumbClick(index)}
            >
              {crumb}
            </span>
          </span>
        ))}
        {currentPath !== "" && (
          <button
            className="folder-activity-flow__back-btn"
            onClick={handleGoUp}
          >
            ← Up
          </button>
        )}
      </div>
      <svg
        className="folder-activity-flow__chart"
        ref={svgRef}
      />
      <div
        className="folder-activity-flow__tooltip"
        ref={tooltipRef}
      />
    </div>
  );
};

export default FolderActivityFlow;
