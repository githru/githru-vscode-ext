import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { useDataStore } from "store";

import { DIMENSIONS } from "./FolderActivityFlow.const";
import "./FolderActivityFlow.scss";
import { extractContributorActivities, extractReleaseBasedContributorActivities } from "./FolderActivityFlow.util";
import { renderClusterVisualization } from "./ClusterVisualization";
import { renderReleaseVisualization } from "./ReleaseVisualization";
import { useFolderNavigation } from "./useFolderNavigation";

const FolderActivityFlow = () => {
  const [totalData] = useDataStore(useShallow((state) => [state.data]));

  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const {
    topFolders,
    currentPath,
    isReleaseMode,
    releaseGroups,
    releaseTopFolderPaths,
    toggleMode,
    navigateToFolder,
    navigateUp,
    navigateToBreadcrumb,
    initializeRootFolders,
    getBreadcrumbs,
  } = useFolderNavigation(totalData);

  useEffect(() => {
    initializeRootFolders();
  }, [initializeRootFolders]);

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
        onFolderClick: navigateToFolder,
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
        onFolderClick: navigateToFolder,
      });
    }
  }, [totalData, topFolders, isReleaseMode, releaseGroups, releaseTopFolderPaths, navigateToFolder]);

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
          type="button"
          className="folder-activity-flow__mode-toggle"
          onClick={toggleMode}
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
              onClick={() => navigateToBreadcrumb(index, getBreadcrumbs().length)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigateToBreadcrumb(index, getBreadcrumbs().length);
                }
              }}
              role="button"
              tabIndex={index === getBreadcrumbs().length - 1 ? -1 : 0}
            >
              {crumb}
            </span>
          </span>
        ))}
        {currentPath !== "" && (
          <button
            type="button"
            className="folder-activity-flow__back-btn"
            onClick={navigateUp}
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
