import * as d3 from "d3";
import { useEffect, useRef, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

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
  const containerRef = useRef<HTMLDivElement>(null);

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

    // 컨테이너 너비 계산 (패딩 50px * 2 = 100px 제외)
    const containerWidth = containerRef.current?.clientWidth || DIMENSIONS.width;
    const chartWidth = containerWidth - 100; // 좌우 패딩 50px씩 제외

    // 차트 높이 고정
    const chartHeight = DIMENSIONS.height;
    const svg = d3.select(svgRef.current).attr("width", chartWidth).attr("height", chartHeight);

    // 실제로 activity가 있는 폴더만 카운트
    const currentDepth = currentPath === "" ? 1 : currentPath.split("/").length + 1;
    const releaseContributorActivities = extractReleaseBasedContributorActivities(
      totalData,
      releaseTopFolderPaths,
      currentDepth
    );

    svg.selectAll("*").remove();

    if (releaseContributorActivities.length === 0) {
      svg
        .append("text")
        .attr("x", chartWidth / 2)
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
      chartWidth,
    });
  }, [totalData, releaseGroups, releaseTopFolderPaths, navigateToFolder, currentPath]);

  return (
    <div className="folder-activity-flow" ref={containerRef}>
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
              underline="none"
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
