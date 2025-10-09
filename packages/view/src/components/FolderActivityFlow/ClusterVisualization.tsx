import * as d3 from "d3";

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

  // 툴팁 초기 상태 설정
  tooltip.style("display", "none");

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
  mainGroup.selectAll<SVGTextElement, FolderActivity>(".folder-label").on("mouseover.showfull", function (_event, d) {
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
    .on("mouseover", function (event: MouseEvent, d: ContributorActivity) {
      const currentRadius = sizeScale(d.changes);
      const hoveredRadius = currentRadius * 1.2;

      // 노드 크기 확대
      d3.select(this)
        .attr("r", hoveredRadius)
        .attr("stroke-width", 2)
        .attr("stroke", "rgba(255, 255, 255, 0.5)");

      // 노드 위치 계산
      const nodeElement = event.target as SVGCircleElement;
      const nodeRect = nodeElement.getBoundingClientRect();
      const tooltipLeft = nodeRect.left + nodeRect.width / 2;
      const tooltipTop = nodeRect.bottom + 8;

      // 툴팁 표시
      tooltip
        .style("display", "inline-block")
        .style("left", `${tooltipLeft}px`)
        .style("top", `${tooltipTop}px`)
        .style("transform", "translateX(-50%)")
        .style("opacity", "0")
        .style("transition", "opacity 0.2s ease-in-out")
        .html(`
          <div class="contributor-activity-tooltip" style="background:rgba(60, 64, 72, 0.9);padding:10px 14px;border-radius:8px;border:none;outline:none;box-shadow:0 3px 6px rgba(0,0,0,0.16);color:#fff;font-size:13px;line-height:1.6;position:relative;">
            <div class="tooltip-arrow" style="position:absolute;top:-6px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:6px solid rgba(60, 64, 72, 0.9);"></div>
            <p><strong>${d.contributorName}'s contribute</strong></p>
            <p style="color:#1fc3b5;display:inline;">+${d.insertions}</p> / <p style="color:#e84b6b;display:inline;">-${d.deletions}</p>
            <p>CLOC # → ${d.changes}</p>
            <p><span style="display:inline-flex;align-items:center;gap:4px;"><svg style="width:16px;height:16px;fill:currentColor;" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg>${d.folderPath === "." ? "root" : d.folderPath.split("/").pop() || d.folderPath}</span></p>
            <p><span style="display:inline-flex;align-items:center;gap:4px;"><svg style="width:16px;height:16px;fill:currentColor;" viewBox="0 0 24 24"><path d="M7 11h2v2H7v-2zm14-5v14c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2l.01-14c0-1.1.88-2 1.99-2h1V2h2v2h8V2h2v2h1c1.1 0 2 .9 2 2zM5 8h14V6H5v2zm14 12V10H5v10h14zm-4-7h2v-2h-2v2zm-4 0h2v-2h-2v2z"/></svg>${d.date.toLocaleDateString()}</span></p>
          </div>
        `);

      // 페이드 인 애니메이션
      setTimeout(() => {
        tooltip.style("opacity", "1");
      }, 10);
    })
    .on("mousemove", () => {
      // 툴팁이 노드 기준으로 고정되므로 mousemove에서는 위치 업데이트 불필요
    })
    .on("mouseout", function (_event: MouseEvent, d: ContributorActivity) {
      const currentRadius = sizeScale(d.changes);

      // 노드 크기 원래대로
      d3.select(this).attr("r", currentRadius).attr("stroke-width", 0);

      // 페이드 아웃 애니메이션
      tooltip.style("opacity", "0");
      setTimeout(() => {
        tooltip.style("display", "none");
      }, 200);
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
