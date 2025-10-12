import * as d3 from "d3";
import { useEffect, useRef, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";

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

  const { topContributorName, releaseRangeLabel } = useMemo(() => {
    if (!totalData || totalData.length === 0 || releaseTopFolderPaths.length === 0) {
      return {
        topContributorName: null,
        releaseRangeLabel: "...",
      };
    }

    const currentDepth = currentPath === "" ? 1 : currentPath.split("/").length + 1;
    const releaseContributorActivities = extractReleaseBasedContributorActivities(
      totalData,
      releaseTopFolderPaths,
      currentDepth
    );

    if (releaseContributorActivities.length === 0) {
      return {
        topContributorName: null,
        releaseRangeLabel: "...",
      };
    }

    const contributorClocs = new Map<string, number>();
    releaseContributorActivities.forEach((activity) => {
      const current = contributorClocs.get(activity.contributorName) || 0;
      contributorClocs.set(activity.contributorName, current + activity.changes);
    });

    let maxCloc = 0;
    let mostActiveContributor = "";
    contributorClocs.forEach((cloc, name) => {
      if (cloc > maxCloc) {
        maxCloc = cloc;
        mostActiveContributor = name;
      }
    });

    const releaseIndices = Array.from(
      new Set(releaseContributorActivities.map((activity) => activity.releaseIndex))
    ).sort((a, b) => a - b);
    const releaseTagByIndex = new Map<number, string>();
    releaseContributorActivities.forEach((activity) => {
      if (!releaseTagByIndex.has(activity.releaseIndex)) {
        releaseTagByIndex.set(activity.releaseIndex, activity.releaseTag);
      }
    });

    const resolvedTags = releaseIndices.map((index) => {
      const tag = releaseTagByIndex.get(index);
      return tag && tag.trim().length > 0 ? tag : `Release ${index}`;
    });

    const firstReleaseLabel = resolvedTags[0] || "...";
    const lastReleaseLabel = resolvedTags[resolvedTags.length - 1] || firstReleaseLabel;
    const rangeLabel = resolvedTags.length <= 1 ? firstReleaseLabel : `${firstReleaseLabel} to ${lastReleaseLabel}`;

    return {
      topContributorName: mostActiveContributor || null,
      releaseRangeLabel: rangeLabel || "...",
    };
  }, [totalData, releaseTopFolderPaths, currentPath]);

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

  const topContributorLabel = topContributorName || "...";

  return (
    <div
      className="folder-activity-flow"
      ref={containerRef}
    >
      <div className="folder-activity-flow__head">
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
              >
                {crumb}
              </Link>
            );
          })}
        </Breadcrumbs>

        <div className="folder-activity-flow__title">
          <WorkspacePremiumRoundedIcon className="folder-activity-flow__title-icon" />
          <span className="folder-activity-flow__title-text">Top contributor is {topContributorLabel}</span>
        </div>

        <div className="folder-activity-flow__subtitle">{releaseRangeLabel}</div>
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
