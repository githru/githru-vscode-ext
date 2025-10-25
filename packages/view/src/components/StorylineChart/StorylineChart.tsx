import * as d3 from "d3";
import { useEffect, useRef, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import { Link } from "@mui/material";

import { useDataStore } from "store";

import { DIMENSIONS, getResponsiveChartWidth } from "./StorylineChart.const";
import "./StorylineChart.scss";
import { extractReleaseBasedContributorActivities } from "./StorylineChart.util";
import { renderReleaseVisualization } from "./ReleaseVisualization";
import { useFolderNavigation } from "./useFolderNavigation";

const StorylineChart = () => {
  const [totalData] = useDataStore(useShallow((state) => [state.data]));

  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);

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
    const updateWidth = () => {
      const containerWidth = containerRef.current?.clientWidth;
      setChartWidth(getResponsiveChartWidth(containerWidth));
    };

    updateWidth();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => updateWidth());
      const containerElement = containerRef.current;
      if (containerElement) {
        observer.observe(containerElement);
      }

      return () => {
        observer.disconnect();
      };
    }

    window.addEventListener("resize", updateWidth);
    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

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

    if (!svgRef.current || chartWidth <= 0) {
      return;
    }

    const svg = d3.select(svgRef.current).attr("width", chartWidth).attr("height", DIMENSIONS.height);

    // activity가 있는 폴더 카운트
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
  }, [totalData, releaseGroups, releaseTopFolderPaths, navigateToFolder, currentPath, chartWidth]);

  const topContributorLabel = topContributorName || "...";

  return (
    <div
      className="storyline-chart"
      ref={containerRef}
    >
      <div className="storyline-chart__head">
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          className="storyline-chart__breadcrumb"
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            if (isLast) {
              return <Typography key={crumb}>{crumb}</Typography>;
            }

            return (
              <Link
                key={crumb}
                href={`#breadcrumb-${crumb}`}
                underline="none"
                aria-label={`Navigate to ${crumb}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigateToBreadcrumb(index, breadcrumbs.length);
                }}
              >
                {crumb}
              </Link>
            );
          })}
        </Breadcrumbs>

        <div className="storyline-chart__title">
          <WorkspacePremiumRoundedIcon className="storyline-chart__title-icon" />
          <span className="storyline-chart__title-text">Top contributor is {topContributorLabel}</span>
        </div>

        <div className="storyline-chart__subtitle">{releaseRangeLabel}</div>
      </div>

      <svg
        className="storyline-chart__chart"
        ref={svgRef}
      />
      <div
        className="storyline-chart__tooltip"
        ref={tooltipRef}
      />
    </div>
  );
};

export default StorylineChart;
