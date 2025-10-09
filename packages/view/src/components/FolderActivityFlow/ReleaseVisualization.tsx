import * as d3 from "d3";
import type React from "react";

import { pxToRem } from "utils/pxToRem";

import { DIMENSIONS } from "./FolderActivityFlow.const";
import type { ReleaseContributorActivity } from "./FolderActivityFlow.type";
import {
  calculateReleaseNodePosition,
  findFirstReleaseContributorNodes,
  generateReleaseFlowLineData,
  generateReleaseFlowLinePath,
} from "./FolderActivityFlow.util";

/**
 * Props for release visualization component
 */
interface ReleaseVisualizationProps {
  /** D3 SVG selection to render into */
  svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>;
  /** Contributor activities grouped by release */
  releaseContributorActivities: ReleaseContributorActivity[];
  /** Top folder paths to display as lanes */
  releaseTopFolderPaths: string[];
  /** Tooltip element reference */
  tooltipRef: React.RefObject<HTMLDivElement>;
  /** Callback when folder is clicked */
  onFolderClick: (folderPath: string) => void;
}

/**
 * Render release-based visualization of contributor activities across folders
 *
 * Displays contributors moving between folders across different releases.
 * Each folder is shown as a horizontal lane, with contributor nodes plotted
 * within release columns. Flow lines connect activities of the same contributor.
 *
 * @param props - Visualization configuration
 */
export const renderReleaseVisualization = ({
  svg,
  releaseContributorActivities,
  releaseTopFolderPaths,
  tooltipRef,
  onFolderClick,
}: ReleaseVisualizationProps) => {
  const tooltip = d3.select(tooltipRef.current);

  // 스케일 설정
  const uniqueContributors = Array.from(new Set(releaseContributorActivities.map((a) => a.contributorName)));
  const uniqueReleases = Array.from(new Set(releaseContributorActivities.map((a) => a.releaseIndex))).sort(
    (a, b) => a - b
  );
  const releaseTagsByIndex = new Map<number, string>();
  releaseContributorActivities.forEach((a) => {
    releaseTagsByIndex.set(a.releaseIndex, a.releaseTag);
  });

  const xScale = d3
    .scaleBand()
    .domain(uniqueReleases.map(String))
    .range([DIMENSIONS.margin.left, DIMENSIONS.width - DIMENSIONS.margin.right])
    .paddingInner(0.1);

  const yScale = d3
    .scaleBand()
    .domain(releaseTopFolderPaths)
    .range([DIMENSIONS.margin.top, DIMENSIONS.height - DIMENSIONS.margin.bottom])
    .paddingInner(0.2);

  const sizeScale = d3
    .scaleSqrt()
    .domain([0, d3.max(releaseContributorActivities, (d) => d.changes) || 1])
    .range([3, 12]);

  const svgElement = svg.node();
  const parentElement = svgElement?.parentElement;
  const chartColors = Array.from({ length: 10 }, (_, i) =>
    getComputedStyle(parentElement || document.documentElement)
      .getPropertyValue(`--chart-color-${i + 1}`)
      .trim()
  );

  const colorScale = d3.scaleOrdinal().domain(uniqueContributors).range(chartColors);

  const mainGroup = svg.append("g");

  mainGroup
    .selectAll(".folder-label")
    .data(releaseTopFolderPaths)
    .enter()
    .append("text")
    .attr("class", (folderPath: string) => {
      const isFile = folderPath.includes(".");
      return isFile ? "folder-label" : "folder-label clickable";
    })
    .attr("x", DIMENSIONS.width - DIMENSIONS.margin.right + 10)
    .attr("y", (folderPath: string) => (yScale(folderPath) || 0) + yScale.bandwidth() / 2)
    .attr("text-anchor", "start")
    .attr("dominant-baseline", "middle")
    .text((folderPath: string) => {
      if (folderPath === ".") return "root";
      const fileName = folderPath.includes("/") ? folderPath.split("/").pop() : folderPath;
      return fileName && fileName.length > 15 ? `${fileName.substring(0, 15)}...` : fileName || "unknown";
    })
    .style("font-size", "12px")
    .style("fill", "#b4bac6")
    .style("font-weight", "500")
    .style("cursor", (folderPath: string) => {
      const isFile = folderPath.includes(".");
      return isFile ? "default" : "pointer";
    })
    .on("click", (_event: MouseEvent, folderPath: string) => {
      const isFile = folderPath.includes(".");
      if (!isFile && folderPath !== ".") {
        onFolderClick(folderPath);
      }
    })
    .on("mouseover", function (_event: MouseEvent, folderPath: string) {
      const isFile = folderPath.includes(".");
      if (!isFile) {
        d3.select(this).style("fill", "#e06091");
      }
    })
    .on("mouseout", function (_event: MouseEvent, folderPath: string) {
      const isFile = folderPath.includes(".");
      const element = d3.select(this);
      if (!isFile) {
        element.style("fill", "#b4bac6");
      }
      // 호버 끝나면 축약된 텍스트로 복원
      const fileName = folderPath.includes("/") ? folderPath.split("/").pop() : folderPath;
      const displayName = fileName && fileName.length > 15 ? `${fileName.substring(0, 15)}...` : fileName || "unknown";
      element.text(folderPath === "." ? "root" : displayName);
    });

  // 호버 시 전체 이름 표시를 위한 추가 이벤트
  mainGroup.selectAll<SVGTextElement, string>(".folder-label").on("mouseover.showfull", function (_event, folderPath) {
    const fileName = folderPath.includes("/") ? folderPath.split("/").pop() : folderPath;
    d3.select(this).text(folderPath === "." ? "root" : fileName || "unknown");
  });

  // 릴리즈 축
  const xAxis = d3
    .axisBottom(xScale)
    .tickFormat((d) => releaseTagsByIndex.get(parseInt(String(d), 10)) || `Release ${parseInt(String(d), 10)}`);

  mainGroup
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${DIMENSIONS.height - DIMENSIONS.margin.bottom})`)
    .call(xAxis);

  // 릴리즈별 노드 위치 계산
  const activitiesByRelease = new Map<number, ReleaseContributorActivity[]>();
  releaseContributorActivities.forEach((activity) => {
    if (!activitiesByRelease.has(activity.releaseIndex)) {
      activitiesByRelease.set(activity.releaseIndex, []);
    }
    const activities = activitiesByRelease.get(activity.releaseIndex);
    if (activities) {
      activities.push(activity);
    }
  });

  // 활동 노드 그리기
  const dots = mainGroup
    .selectAll(".activity-dot")
    .data(releaseContributorActivities)
    .enter()
    .append("circle")
    .attr("class", "activity-dot")
    .attr("cx", (d: ReleaseContributorActivity) => calculateReleaseNodePosition(d, xScale, activitiesByRelease))
    .attr("cy", (d: ReleaseContributorActivity) => (yScale(d.folderPath) || 0) + yScale.bandwidth() / 2)
    .attr("r", (d: ReleaseContributorActivity) => sizeScale(d.changes))
    .attr("fill", (d: ReleaseContributorActivity) => colorScale(d.contributorName) as string)
    .attr("fill-opacity", 0.8);

  // 툴팁 이벤트
  dots
    .on("mouseover", (event: MouseEvent, d: ReleaseContributorActivity) => {
      tooltip
        .style("display", "inline-block")
        .style("left", pxToRem(event.pageX + 10))
        .style("top", pxToRem(event.pageY - 10)).html(`
          <div class="contributor-activity-tooltip">
            <p><strong>${d.contributorName}</strong></p>
            <p>Release: ${d.releaseTag}</p>
            <p>Folder: ${d.folderPath === "." ? "root" : d.folderPath}</p>
            <p>Date: ${d.date.toLocaleDateString()}</p>
            <p>Changes: ${d.changes}</p>
            <p style="color: #28a745;">+${d.insertions} insertions</p>
            <p style="color: #dc3545;">-${d.deletions} deletions</p>
          </div>
        `);
    })
    .on("mousemove", (event: MouseEvent) => {
      tooltip.style("left", pxToRem(event.pageX + 10)).style("top", pxToRem(event.pageY - 10));
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");
    });

  // 기여자별 첫 노드에 이름 라벨
  const firstNodesByContributor = findFirstReleaseContributorNodes(releaseContributorActivities);

  mainGroup
    .selectAll(".contributor-label")
    .data(Array.from(firstNodesByContributor.values()))
    .enter()
    .append("text")
    .attr("class", "contributor-label")
    .attr("x", (d: ReleaseContributorActivity) => calculateReleaseNodePosition(d, xScale, activitiesByRelease))
    .attr(
      "y",
      (d: ReleaseContributorActivity) => (yScale(d.folderPath) || 0) + yScale.bandwidth() / 2 - sizeScale(d.changes) - 5
    )
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "bottom")
    .text((d: ReleaseContributorActivity) => d.contributorName)
    .style("font-size", "10px")
    .style("fill", "#f7f7f7")
    .style("font-weight", "500")
    .style("pointer-events", "none");

  // 플로우 라인 그리기
  const flowLineData = generateReleaseFlowLineData(releaseContributorActivities);

  mainGroup
    .selectAll(".flow-line")
    .data(flowLineData)
    .enter()
    .append("path")
    .attr("class", "flow-line")
    .attr("d", (d) => generateReleaseFlowLinePath(d, xScale, yScale))
    .attr("fill", "none")
    .attr("stroke", (d) => colorScale(d.contributorName) as string)
    .attr("stroke-width", 2)
    .attr("stroke-opacity", 1);
};
