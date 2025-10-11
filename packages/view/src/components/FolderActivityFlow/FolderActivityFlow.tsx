import * as d3 from "d3";
import { useEffect, useRef, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import { useDataStore } from "store";

import { DIMENSIONS, calculateChartHeight } from "./FolderActivityFlow.const";
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
    navigateToBreadcrumb,
    initializeRootFolders,
    getBreadcrumbs,
  } = useFolderNavigation(totalData);

  useEffect(() => {
    initializeRootFolders();
  }, [initializeRootFolders]);

  const breadcrumbs = useMemo(() => getBreadcrumbs(), [getBreadcrumbs]);

  useEffect(() => {
    if (!totalData || totalData.length === 0) {
      return;
    }

    if (releaseGroups.length === 0 || releaseTopFolderPaths.length === 0) {
      return;
    }

    // 폴더 개수에 따라 동적으로 높이 계산
    const chartHeight = calculateChartHeight(releaseTopFolderPaths.length);
    const svg = d3.select(svgRef.current).attr("width", DIMENSIONS.width).attr("height", chartHeight);

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
        .attr("y", chartHeight / 2)
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
      chartHeight,
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

      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        className="folder-activity-flow__breadcrumb"
      >
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          if (isLast) {
            return (
              <Typography key={crumb}>
                {crumb}
              </Typography>
            );
          }

          return (
            <Link
              key={crumb}
              underline="hover"
              component="button"
              onClick={() => navigateToBreadcrumb(index, breadcrumbs.length)}
              sx={{ cursor: "pointer" }}
            >
              {crumb}
            </Link>
          );
        })}
      </Breadcrumbs>
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
