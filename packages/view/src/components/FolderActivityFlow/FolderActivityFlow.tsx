import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { useDataStore } from "store";

import { DIMENSIONS } from "./FolderActivityFlow.const";
import "./FolderActivityFlow.scss";
import { extractReleaseBasedContributorActivities } from "./FolderActivityFlow.util";
import { renderReleaseVisualization } from "./ReleaseVisualization";
import { useFolderNavigation } from "./useFolderNavigation";

const FolderActivityFlow = () => {
  const [totalData] = useDataStore(useShallow((state) => [state.data]));

  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const {
    currentPath,
    releaseGroups,
    releaseTopFolderPaths,
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

    if (releaseGroups.length === 0 || releaseTopFolderPaths.length === 0) {
      return;
    }

    const svg = d3.select(svgRef.current).attr("width", DIMENSIONS.width).attr("height", DIMENSIONS.height);

    svg.selectAll("*").remove();

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
  }, [totalData, releaseGroups, releaseTopFolderPaths, navigateToFolder, currentPath]);

  return (
    <div className="folder-activity-flow">
      <div className="folder-activity-flow__header">
        <div>
          <p className="folder-activity-flow__title">Contributors Folder Activity Flow</p>
          <div className="folder-activity-flow__subtitle">Contributors moving between folders across releases</div>
        </div>
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
