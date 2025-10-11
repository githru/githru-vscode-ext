import * as d3 from "d3";
import { useEffect, useRef, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

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

  const topContributor = useMemo(() => {
    if (releaseGroups.length === 0 || releaseTopFolderPaths.length === 0) {
      return null;
    }

    const currentDepth = currentPath === "" ? 1 : currentPath.split("/").length + 1;
    const releaseContributorActivities = extractReleaseBasedContributorActivities(
      totalData,
      releaseTopFolderPaths,
      currentDepth
    );

    // 기여자별 총 CLOC 계산
    const contributorClocs = new Map<string, number>();
    releaseContributorActivities.forEach((activity) => {
      const current = contributorClocs.get(activity.contributorName) || 0;
      contributorClocs.set(activity.contributorName, current + activity.changes);
    });

    // 가장 많은 CLOC를 기록한 기여자 찾기
    let maxCloc = 0;
    let topContributorName = "";
    contributorClocs.forEach((cloc, name) => {
      if (cloc > maxCloc) {
        maxCloc = cloc;
        topContributorName = name;
      }
    });

    return topContributorName || null;
  }, [totalData, releaseGroups, releaseTopFolderPaths, currentPath]);

  useEffect(() => {
    if (!totalData || totalData.length === 0) {
      return;
    }

    if (releaseGroups.length === 0 || releaseTopFolderPaths.length === 0) {
      return;
    }

    const svg = d3
      .select(svgRef.current)
      .attr("width", (containerRef.current?.clientWidth || DIMENSIONS.width) - 100)
      .attr("height", DIMENSIONS.height);

    //activity가 있는 폴더 카운트
    const currentDepth = currentPath === "" ? 1 : currentPath.split("/").length + 1;
    const releaseContributorActivities = extractReleaseBasedContributorActivities(
      totalData,
      releaseTopFolderPaths,
      currentDepth
    );

    svg.selectAll("*").remove();

    if (releaseContributorActivities.length === 0) {
      const chartWidth = (containerRef.current?.clientWidth || DIMENSIONS.width) - 100;
      svg
        .append("text")
        .attr("x", chartWidth / 2)
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

  const topContributorLabel = topContributor || "...";

  return (
    <div
      className="folder-activity-flow"
      ref={containerRef}
    >
      <div className="folder-activity-flow__title">
        <WorkspacePremiumIcon />
        <span>Top contributor is {topContributorLabel}</span>
      </div>

      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        className="folder-activity-flow__breadcrumb"
      >
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          if (isLast) {
            return <Typography key={crumb}>{crumb}</Typography>;
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
