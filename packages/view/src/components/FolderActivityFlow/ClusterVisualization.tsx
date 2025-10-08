import * as d3 from "d3";
import { pxToRem } from "utils/pxToRem";

import type { FolderActivity } from "./FolderActivityFlow.analyzer";
import { DIMENSIONS } from "./FolderActivityFlow.const";
import type { ContributorActivity } from "./FolderActivityFlow.type";
import {
  calculateNodePosition,
  findFirstContributorNodes,
  generateFlowLineData,
  generateFlowLinePath,
} from "./FolderActivityFlow.util";

/**
 * Props for cluster visualization component
 */
interface ClusterVisualizationProps {
  /** D3 SVG selection to render into */
  svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>;
  /** Contributor activities to visualize */
  contributorActivities: ContributorActivity[];
  /** Top folders to display as lanes */
  topFolders: FolderActivity[];
  /** Tooltip element reference */
  tooltipRef: React.RefObject<HTMLDivElement>;
  /** Callback when folder is clicked */
  onFolderClick: (folderPath: string) => void;
}

/**
 * Render cluster-based visualization of contributor activities across folders
 *
 * Displays contributors moving between folders over time, grouped by clusters.
 * Each folder is shown as a horizontal lane, with contributor nodes plotted
 * within cluster columns. Flow lines connect activities of the same contributor.
 *
 * @param props - Visualization configuration
 */
export const renderClusterVisualization = ({
  svg,
  contributorActivities,
  topFolders,
  tooltipRef,
  onFolderClick,
}: ClusterVisualizationProps) => {
  const tooltip = d3.select(tooltipRef.current);

  // 스케일 설정
  const uniqueContributors = Array.from(new Set(contributorActivities.map((a) => a.contributorName)));
  const uniqueClusters = Array.from(new Set(contributorActivities.map((a) => a.clusterIndex))).sort((a, b) => a - b);

  const xScale = d3
    .scaleBand()
    .domain(uniqueClusters.map(String))
    .range([DIMENSIONS.margin.left, DIMENSIONS.width - DIMENSIONS.margin.right])
    .paddingInner(0.1);

  const yScale = d3
    .scaleBand()
    .domain(topFolders.map((f) => f.folderPath))
    .range([DIMENSIONS.margin.top, DIMENSIONS.height - DIMENSIONS.margin.bottom])
    .paddingInner(0.2);

  const sizeScale = d3
    .scaleSqrt()
    .domain([0, d3.max(contributorActivities, (d) => d.changes) || 1])
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
    .data(topFolders)
    .enter()
    .append("text")
    .attr("class", (d: FolderActivity) => {
      const isFile = d.folderPath.includes(".");
      return isFile ? "folder-label" : "folder-label clickable";
    })
    .attr("x", DIMENSIONS.width - DIMENSIONS.margin.right + 10)
    .attr("y", (d: FolderActivity) => (yScale(d.folderPath) || 0) + yScale.bandwidth() / 2)
    .attr("text-anchor", "start")
    .attr("dominant-baseline", "middle")
    .text((d: FolderActivity) => {
      if (d.folderPath === ".") return "root";

      const fileName = d.folderPath.includes("/") ? d.folderPath.split("/").pop() : d.folderPath;

      return fileName && fileName.length > 15 ? `${fileName.substring(0, 15)}...` : fileName || "unknown";
    })
    .style("font-size", "12px")
    .style("fill", "#b4bac6")
    .style("font-weight", "500")
    .style("cursor", (d: FolderActivity) => {
      const isFile = d.folderPath.includes(".");
      return isFile ? "default" : "pointer";
    })
    .on("click", (_event: MouseEvent, d: FolderActivity) => {
      const isFile = d.folderPath.includes(".");
      if (!isFile && d.folderPath !== ".") {
        onFolderClick(d.folderPath);
      }
    })
    .on("mouseover", function (_event: MouseEvent, d: FolderActivity) {
      const isFile = d.folderPath.includes(".");
      if (!isFile) {
        d3.select(this).style("fill", "#e06091");
      }
    })
    .on("mouseout", function (_event: MouseEvent, d: FolderActivity) {
      const isFile = d.folderPath.includes(".");
      const element = d3.select(this);
      if (!isFile) {
        element.style("fill", "#b4bac6");
      }
      // 호버 끝나면 축약된 텍스트로 복원
      const fileName = d.folderPath.includes("/") ? d.folderPath.split("/").pop() : d.folderPath;
      const displayName = fileName && fileName.length > 15 ? `${fileName.substring(0, 15)}...` : fileName || "unknown";
      element.text(d.folderPath === "." ? "root" : displayName);
    });

  // 호버 시 전체 이름 표시를 위한 추가 이벤트
  mainGroup
    .selectAll<SVGTextElement, FolderActivity>(".folder-label")
    .on("mouseover.showfull", function (_event, d) {
      const fileName = d.folderPath.includes("/") ? d.folderPath.split("/").pop() : d.folderPath;
      d3.select(this).text(d.folderPath === "." ? "root" : fileName || "unknown");
    });

  // 클러스터 축
  const xAxis = d3.axisBottom(xScale).tickFormat((d) => `Cluster ${parseInt(String(d)) + 1}`);

  mainGroup
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${DIMENSIONS.height - DIMENSIONS.margin.bottom})`)
    .call(xAxis);

  // 클러스터 내 노드 위치 계산
  const activitiesByCluster = new Map<number, ContributorActivity[]>();
  contributorActivities.forEach((activity) => {
    if (!activitiesByCluster.has(activity.clusterIndex)) {
      activitiesByCluster.set(activity.clusterIndex, []);
    }
    activitiesByCluster.get(activity.clusterIndex)!.push(activity);
  });

  // 활동 노드 그리기
  const dots = mainGroup
    .selectAll(".activity-dot")
    .data(contributorActivities)
    .enter()
    .append("circle")
    .attr("class", "activity-dot")
    .attr("cx", (d: ContributorActivity) => calculateNodePosition(d, xScale, activitiesByCluster))
    .attr("cy", (d: ContributorActivity) => (yScale(d.folderPath) || 0) + yScale.bandwidth() / 2)
    .attr("r", (d: ContributorActivity) => sizeScale(d.changes))
    .attr("fill", (d: ContributorActivity) => colorScale(d.contributorName) as string)
    .attr("fill-opacity", 0.8);

  // 툴팁 이벤트
  dots
    .on("mouseover", (event: MouseEvent, d: ContributorActivity) => {
      tooltip
        .style("display", "inline-block")
        .style("left", pxToRem(event.pageX + 10))
        .style("top", pxToRem(event.pageY - 10)).html(`
          <div class="contributor-activity-tooltip">
            <p><strong>${d.contributorName}</strong></p>
            <p>Cluster: ${d.clusterIndex + 1}</p>
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
  const firstNodesByContributor = findFirstContributorNodes(contributorActivities);

  mainGroup
    .selectAll(".contributor-label")
    .data(Array.from(firstNodesByContributor.values()))
    .enter()
    .append("text")
    .attr("class", "contributor-label")
    .attr("x", (d: ContributorActivity) => calculateNodePosition(d, xScale, activitiesByCluster))
    .attr(
      "y",
      (d: ContributorActivity) => (yScale(d.folderPath) || 0) + yScale.bandwidth() / 2 - sizeScale(d.changes) - 5
    )
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "bottom")
    .text((d: ContributorActivity) => d.contributorName)
    .style("font-size", "10px")
    .style("fill", "#f7f7f7")
    .style("font-weight", "500")
    .style("pointer-events", "none");

  // 플로우 라인 그리기
  const flowLineData = generateFlowLineData(contributorActivities);

  mainGroup
    .selectAll(".flow-line")
    .data(flowLineData)
    .enter()
    .append("path")
    .attr("class", "flow-line")
    .attr("d", (d) => generateFlowLinePath(d, xScale, yScale))
    .attr("fill", "none")
    .attr("stroke", (d) => colorScale(d.contributorName) as string)
    .attr("stroke-width", 2)
    .attr("stroke-opacity", 1);
};
