import * as d3 from "d3";
import type React from "react";

import { DIMENSIONS, LABEL_COLUMN_PADDING } from "./StorylineChart.const";
import type { ReleaseContributorActivity, ReleaseGapLineData } from "./StorylineChart.type";
import {
  calculateReleaseNodePosition,
  findFirstReleaseContributorNodes,
  generateReleaseFlowLineData,
  generateReleaseGapLineData,
} from "./StorylineChart.util";

/**
 * Props for release visualization component
 */
interface ReleaseVisualizationProps {
  /** D3 SVG selection to render into */
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  /** Contributor activities grouped by release */
  releaseContributorActivities: ReleaseContributorActivity[];
  /** Top folder paths to display as lanes */
  releaseTopFolderPaths: string[];
  /** Tooltip element reference */
  tooltipRef: React.RefObject<HTMLDivElement>;
  /** Callback when folder is clicked */
  onFolderClick: (folderPath: string) => void;
  /** Top contributor name for crown decoration */
  topContributorName?: string | null;
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
  topContributorName,
}: ReleaseVisualizationProps) => {
  const tooltip = d3.select(tooltipRef.current);

  let tooltipShowTimer: ReturnType<typeof setTimeout> | null = null;
  let tooltipHideTimer: ReturnType<typeof setTimeout> | null = null;
  let selectedContributor: string | null = null;

  // 스케일 설정
  const uniqueContributors = Array.from(new Set(releaseContributorActivities.map((a) => a.contributorName)));
  const uniqueReleases = Array.from(new Set(releaseContributorActivities.map((a) => a.releaseIndex))).sort(
    (a, b) => a - b
  );
  const releaseTagsByIndex = new Map<number, string>();
  releaseContributorActivities.forEach((a) => {
    releaseTagsByIndex.set(a.releaseIndex, a.releaseTag);
  });

  // 실제로 노드(activity)가 있는 폴더만 필터링
  const activeFolderPaths = Array.from(new Set(releaseContributorActivities.map((a) => a.folderPath)));
  const filteredFolderPaths = releaseTopFolderPaths.filter((path) => activeFolderPaths.includes(path));

  const chartWidth = Number(svg.attr("width"));

  const xScale = d3
    .scaleBand()
    .domain(uniqueReleases.map(String))
    .range([DIMENSIONS.margin.left, chartWidth - DIMENSIONS.margin.right])
    .paddingInner(0.1)
    .paddingOuter(0.05);

  const yScale = d3
    .scaleBand()
    .domain(filteredFolderPaths)
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
    .data(filteredFolderPaths)
    .enter()
    .append("text")
    .attr("class", (folderPath: string) => {
      const isFile = folderPath.includes(".");
      return isFile ? "folder-label" : "folder-label clickable";
    })
    .attr("x", chartWidth - DIMENSIONS.margin.right + LABEL_COLUMN_PADDING)
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

  // 릴리즈별 노드 위치 계산 (시간 순으로 정렬)
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

  // 각 릴리즈 내에서 시간 순으로 정렬
  activitiesByRelease.forEach((activities) => {
    activities.sort((a, b) => a.date.getTime() - b.date.getTime());
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
    .on("mouseover", function (event: MouseEvent, d: ReleaseContributorActivity) {
      if (tooltipHideTimer) {
        clearTimeout(tooltipHideTimer);
        tooltipHideTimer = null;
      }
      if (tooltipShowTimer) {
        clearTimeout(tooltipShowTimer);
        tooltipShowTimer = null;
      }

      const currentRadius = sizeScale(d.changes);
      const hoveredRadius = currentRadius * 1.2;

      // 노드 크기 확대
      d3.select(this).attr("r", hoveredRadius).attr("stroke-width", 2).attr("stroke", "rgba(255, 255, 255, 0.5)");

      // 노드 위치 계산
      const nodeElement = event.target as SVGCircleElement;
      const cx = parseFloat(nodeElement.getAttribute("cx") || "0");
      const cy = parseFloat(nodeElement.getAttribute("cy") || "0");

      // SVG 좌표를 화면 좌표로 변환
      const ownerSvgElement = nodeElement.ownerSVGElement;
      if (!ownerSvgElement) return;
      const svgPoint = ownerSvgElement.createSVGPoint();
      svgPoint.x = cx;
      svgPoint.y = cy;
      const ctm = nodeElement.getScreenCTM();
      if (!ctm) return;
      const screenPoint = svgPoint.matrixTransform(ctm);

      const tooltipLeft = screenPoint.x;
      const tooltipTop = screenPoint.y;

      // 툴팁 표시
      tooltip
        .style("display", "inline-block")
        .style("left", `${tooltipLeft}px`)
        .style("top", `${tooltipTop}px`)
        .style("transform", "translateX(-50%)")
        .style("opacity", "0")
        .style("transition", "opacity 0.2s ease-in-out").html(`
          <div class="contributor-activity-tooltip">
            <p><strong>${d.contributorName}'s contribute</strong></p>
            <p class="insertions">+${d.insertions}</p> / <p class="deletions">-${d.deletions}</p>
            <p>CLOC # → ${d.changes}</p>
            <p><span class="icon-wrapper"><svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg>${d.folderPath === "." ? "root" : d.folderPath.split("/").pop() || d.folderPath}</span></p>
            <p><span class="icon-wrapper"><svg viewBox="0 0 24 24"><path d="M7 11h2v2H7v-2zm14-5v14c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2l.01-14c0-1.1.88-2 1.99-2h1V2h2v2h8V2h2v2h1c1.1 0 2 .9 2 2zM5 8h14V6H5v2zm14 12V10H5v10h14zm-4-7h2v-2h-2v2zm-4 0h2v-2h-2v2z"/></svg>${d.date.toLocaleDateString()}</span></p>
          </div>
        `);

      // 페이드 인 애니메이션
      tooltipShowTimer = setTimeout(() => {
        tooltip.style("opacity", "1");
        tooltipShowTimer = null;
      }, 10);
    })
    .on("mouseout", function (_event: MouseEvent, d: ReleaseContributorActivity) {
      if (tooltipShowTimer) {
        clearTimeout(tooltipShowTimer);
        tooltipShowTimer = null;
      }
      if (tooltipHideTimer) {
        clearTimeout(tooltipHideTimer);
        tooltipHideTimer = null;
      }

      const currentRadius = sizeScale(d.changes);

      // 노드 크기 원래대로
      d3.select(this).attr("r", currentRadius).attr("stroke-width", 0);

      // 페이드 아웃 애니메이션
      tooltip.style("opacity", "0");
      tooltipHideTimer = setTimeout(() => {
        tooltip.style("display", "none");
        tooltipHideTimer = null;
      }, 200);
    });

  // 기여자별 첫 노드에 이름 라벨
  const firstNodesByContributor = findFirstReleaseContributorNodes(releaseContributorActivities);

  // 라벨 그룹 생성
  const labelGroups = mainGroup
    .selectAll(".contributor-label-group")
    .data(Array.from(firstNodesByContributor.values()))
    .enter()
    .append("g")
    .attr("class", "contributor-label-group");

  // 왕관 아이콘 추가 (Top contributor에게만)
  labelGroups
    .filter((d: ReleaseContributorActivity) => Boolean(topContributorName && d.contributorName === topContributorName))
    .append("text")
    .attr("class", "contributor-crown")
    .attr("x", (d: ReleaseContributorActivity) => calculateReleaseNodePosition(d, xScale, activitiesByRelease) - 15)
    .attr(
      "y",
      (d: ReleaseContributorActivity) => (yScale(d.folderPath) || 0) + yScale.bandwidth() / 2 - sizeScale(d.changes) - 5
    )
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "bottom")
    .text("👑")
    .style("font-size", "14px")
    .style("pointer-events", "none");

  // 이름 라벨
  labelGroups
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
    .style("font-weight", "500");

  // 플로우 라인 그리기
  const flowLineData = generateReleaseFlowLineData(releaseContributorActivities);
  const gapLineData = generateReleaseGapLineData(releaseContributorActivities);

  const flowLines = mainGroup
    .selectAll(".flow-line")
    .data(flowLineData)
    .enter()
    .append("path")
    .attr("class", "flow-line")
    .attr("d", (d) => {
      // 실제 노드 위치를 찾아서 경로 생성 (날짜까지 매칭)
      const startActivity = releaseContributorActivities.find(
        (a) =>
          a.releaseIndex === d.startReleaseIndex &&
          a.folderPath === d.startFolder &&
          a.contributorName === d.contributorName &&
          a.date.getTime() === d.startDate.getTime()
      );
      const endActivity = releaseContributorActivities.find(
        (a) =>
          a.releaseIndex === d.endReleaseIndex &&
          a.folderPath === d.endFolder &&
          a.contributorName === d.contributorName &&
          a.date.getTime() === d.endDate.getTime()
      );

      if (!startActivity || !endActivity) {
        return "";
      }

      const x1 = calculateReleaseNodePosition(startActivity, xScale, activitiesByRelease);
      const y1 = (yScale(d.startFolder) || 0) + yScale.bandwidth() / 2;
      const x2 = calculateReleaseNodePosition(endActivity, xScale, activitiesByRelease);
      const y2 = (yScale(d.endFolder) || 0) + yScale.bandwidth() / 2;
      const midX = (x1 + x2) / 2;
      return `M ${x1},${y1} Q ${midX},${y1} ${midX},${(y1 + y2) / 2} Q ${midX},${y2} ${x2},${y2}`;
    })
    .attr("fill", "none")
    .attr("stroke", (d) => colorScale(d.contributorName) as string)
    .attr("stroke-width", 2)
    .attr("stroke-opacity", 0.6)
    .attr("stroke-dasharray", "none") // 일반 라인은 실선
    .style("cursor", "pointer")
    .style("transition", "all 0.3s ease");

  // 갭 라인 그리기 (작업하지 않은 릴리즈 구간) - 기본적으로 숨김
  const gapLines = mainGroup
    .selectAll(".gap-line")
    .data(gapLineData)
    .enter()
    .append("path")
    .attr("class", "gap-line")
    .attr("data-contributor", (d) => d.contributorName)
    .attr("d", (d) => {
      // 가장 최근 활동 노드 위치 찾기
      const startActivities = releaseContributorActivities.filter(
        (a) => a.releaseIndex === d.startReleaseIndex && a.contributorName === d.contributorName
      );
      const endActivities = releaseContributorActivities.filter(
        (a) => a.releaseIndex === d.endReleaseIndex && a.contributorName === d.contributorName
      );

      if (startActivities.length === 0 || endActivities.length === 0) {
        return "";
      }

      // 마지막 활동과 첫 활동 연결
      const startActivity = startActivities[startActivities.length - 1];
      const endActivity = endActivities[0];

      const x1 = calculateReleaseNodePosition(startActivity, xScale, activitiesByRelease);
      const y1 = (yScale(d.startFolder) || 0) + yScale.bandwidth() / 2;
      const x2 = calculateReleaseNodePosition(endActivity, xScale, activitiesByRelease);
      const y2 = (yScale(d.endFolder) || 0) + yScale.bandwidth() / 2;
      const midX = (x1 + x2) / 2;
      return `M ${x1},${y1} Q ${midX},${y1} ${midX},${(y1 + y2) / 2} Q ${midX},${y2} ${x2},${y2}`;
    })
    .attr("fill", "none")
    .attr("stroke", "#666666") // 갭 라인은 회색으로 통일
    .attr("stroke-width", 2) // 점선 두께 줄임
    .attr("stroke-opacity", 0) // 기본적으로 숨김
    .attr("stroke-dasharray", "12,6") // 갭 라인은 점선
    .style("cursor", "pointer")
    .style("transition", "all 0.3s ease")
    .style("display", "none"); // 기본적으로 숨김

  // 갭 라인 중간에 배경 원 추가 - 기본적으로 숨김
  const gapIconBackgrounds = mainGroup
    .selectAll(".gap-icon-bg")
    .data(gapLineData)
    .enter()
    .append("circle")
    .attr("class", "gap-icon-bg")
    .attr("data-contributor", (d) => d.contributorName)
    .attr("cx", (d: ReleaseGapLineData) => {
      const startX = (xScale(String(d.startReleaseIndex)) || 0) + xScale.bandwidth() / 2;
      const endX = (xScale(String(d.endReleaseIndex)) || 0) + xScale.bandwidth() / 2;
      return (startX + endX) / 2;
    })
    .attr("cy", (d: ReleaseGapLineData) => {
      const startY = (yScale(d.startFolder) || 0) + yScale.bandwidth() / 2;
      const endY = (yScale(d.endFolder) || 0) + yScale.bandwidth() / 2;
      return (startY + endY) / 2;
    })
    .attr("r", 18)
    .attr("fill", "#222324")
    .attr("stroke", "#666666") // 갭 아이콘 배경도 회색으로
    .attr("stroke-width", 2)
    .style("opacity", 0)
    .style("display", "none");

  // 갭 라인 중간에 MUI 아이콘 추가 - 기본적으로 숨김
  const gapIcons = mainGroup
    .selectAll(".gap-icon")
    .data(gapLineData)
    .enter()
    .append("g")
    .attr("class", "gap-icon")
    .attr("data-contributor", (d) => d.contributorName)
    .attr("transform", (d: ReleaseGapLineData) => {
      const startX = (xScale(String(d.startReleaseIndex)) || 0) + xScale.bandwidth() / 2;
      const endX = (xScale(String(d.endReleaseIndex)) || 0) + xScale.bandwidth() / 2;
      const startY = (yScale(d.startFolder) || 0) + yScale.bandwidth() / 2;
      const endY = (yScale(d.endFolder) || 0) + yScale.bandwidth() / 2;
      const x = (startX + endX) / 2;
      const y = (startY + endY) / 2;
      return `translate(${x - 10}, ${y - 10})`; // 아이콘 중심 조정
    })
    .style("opacity", 0) // 기본적으로 숨김
    .style("pointer-events", "none")
    .style("display", "none"); // 기본적으로 숨김

  // 달 아이콘 SVG path 추가
  gapIcons
    .append("path")
    .attr(
      "d",
      "M9.5 2c-1.82 0-3.53.5-5 1.35 2.99 1.73 5 4.95 5 8.65s-2.01 6.92-5 8.65C5.97 21.5 7.68 22 9.5 22c5.52 0 10-4.48 10-10S15.02 2 9.5 2z"
    )
    .attr("fill", "#b4bac6")
    .attr("transform", "scale(0.8)"); // 크기 조정

  // 하이라이트 해제 함수
  const clearHighlight = () => {
    selectedContributor = null;
    flowLines.attr("stroke-opacity", 0.6).attr("stroke-width", 2).style("stroke-dasharray", "none");
    // 갭 라인과 아이콘 숨김
    gapLines.attr("stroke-opacity", 0).attr("stroke-width", 3).style("display", "none");
    gapIconBackgrounds.style("opacity", 0).style("display", "none");
    gapIcons.style("opacity", 0).style("display", "none");
    dots.attr("fill-opacity", 0.8).attr("stroke-width", 0);
    labelGroups
      .selectAll<SVGTextElement, ReleaseContributorActivity>(".contributor-label")
      .style("fill", "#f7f7f7")
      .style("font-weight", "500");
  };

  // 하이라이트 함수
  const highlightContributor = (contributorName: string) => {
    if (selectedContributor === contributorName) {
      clearHighlight();
      return;
    }

    selectedContributor = contributorName;

    // 모든 라인 흐리게
    flowLines
      .attr("stroke-opacity", (d) => (d.contributorName === contributorName ? 1 : 0.1))
      .attr("stroke-width", (d) => (d.contributorName === contributorName ? 4 : 2))
      .style("stroke-dasharray", (d) => (d.contributorName === contributorName ? "none" : "none")); // 선택된 라인은 실선

    // 선택된 contributor의 갭 라인만 보이기 (더 강하게)
    gapLines
      .style("display", (d) => (d.contributorName === contributorName ? "block" : "none"))
      .attr("stroke-opacity", (d) => (d.contributorName === contributorName ? 0.8 : 0))
      .attr("stroke-width", (d) => (d.contributorName === contributorName ? 3 : 2)); // 갭 라인도 두께 줄임

    // 선택된 contributor의 갭 배경 원만 보이기
    gapIconBackgrounds
      .style("display", (d: ReleaseGapLineData) => (d.contributorName === contributorName ? "block" : "none"))
      .style("opacity", (d: ReleaseGapLineData) => (d.contributorName === contributorName ? 0.9 : 0));

    // 선택된 contributor의 갭 아이콘만 보이기
    gapIcons
      .style("display", (d: ReleaseGapLineData) => (d.contributorName === contributorName ? "block" : "none"))
      .style("opacity", (d: ReleaseGapLineData) => (d.contributorName === contributorName ? 1 : 0));

    // 달리는 캐릭터 애니메이션
    const contributorFlowLines = flowLines.filter((d) => d.contributorName === contributorName);
    const contributorGapLines = gapLines.filter((d) => d.contributorName === contributorName);

    // 모든 라인을 하나의 연속된 경로로 만들기
    const allLines = [...contributorFlowLines.data(), ...contributorGapLines.data()];

    if (allLines.length > 0) {
      // 달리는 캐릭터 그룹 생성
      const runnerGroup = mainGroup.append("g").attr("class", "runner-group").style("display", "block");

      // 로켓 캐릭터 추가
      const runner = runnerGroup.append("g").attr("class", "runner").style("opacity", 0);

      // 로켓 SVG path (기본 상태)
      runner
        .append("path")
        .attr("d", "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z")
        .attr("fill", "#ff6b35")
        .attr("transform", "scale(0.8)");

      // 로켓 불꽃 효과 (기본 상태)
      const rocketFlame = runner
        .append("path")
        .attr("d", "M12 15l-2-2 2-2 2 2-2 2z")
        .attr("fill", "#ffd700")
        .attr("transform", "scale(0.6) translate(0, 8)");

      // 자는 모습 (기본적으로 숨김)
      const sleepingFace = runner.append("g").attr("class", "sleeping-face").style("opacity", 0);

      // 자는 얼굴 (눈 감은 모습)
      sleepingFace.append("circle").attr("cx", 12).attr("cy", 8).attr("r", 1.5).attr("fill", "#333");

      // 자는 표시 (zzz)
      sleepingFace
        .append("text")
        .attr("x", 12)
        .attr("y", 12)
        .attr("text-anchor", "middle")
        .attr("font-size", "8")
        .attr("fill", "#666")
        .text("zzz");

      // 첫 번째 라인에서 시작
      const firstLine = contributorFlowLines.nodes()[0] as SVGPathElement;
      if (firstLine) {
        const startPoint = firstLine.getPointAtLength(0);

        // 로켓을 시작점에 배치
        runner.attr("transform", `translate(${startPoint.x}, ${startPoint.y})`).style("opacity", 1);

        // 전체 경로를 따라 애니메이션
        let currentLineIndex = 0;
        const animateNextLine = () => {
          if (currentLineIndex < allLines.length) {
            const currentLine =
              currentLineIndex < contributorFlowLines.size()
                ? (contributorFlowLines.nodes()[currentLineIndex] as SVGPathElement)
                : (gapLines.nodes()[currentLineIndex - contributorFlowLines.size()] as SVGPathElement);

            if (currentLine) {
              const pathLength = currentLine.getTotalLength();
              const isGapLine = currentLineIndex >= contributorFlowLines.size();

              // 라인 하이라이트
              d3.select(currentLine)
                .attr("stroke-width", isGapLine ? 4 : 5)
                .attr("stroke-opacity", 1)
                .style("stroke-dasharray", isGapLine ? "10,6" : "none");

              if (isGapLine) {
                // 갭 라인인 경우: 자는 모습으로 변경하고 이동하지 않음
                rocketFlame.style("opacity", 0);
                sleepingFace.style("opacity", 1);

                // 로켓을 갭 라인 위에 위치시키기
                const gapStartPoint = currentLine.getPointAtLength(0);
                runner.attr("transform", `translate(${gapStartPoint.x}, ${gapStartPoint.y - 15})`);

                // 로켓은 그 자리에서 멈춰있고, 라인만 하이라이트
                setTimeout(() => {
                  // 라인 스타일 복원
                  d3.select(currentLine).style("stroke-dasharray", "12,6").attr("stroke-width", 3);

                  currentLineIndex += 1;
                  animateNextLine();
                }, 1500); // 1.5초 동안 자는 모습 유지
              } else {
                // 실선 라인인 경우: 활성 상태로 변경하고 이동
                rocketFlame.style("opacity", 1);
                sleepingFace.style("opacity", 0);

                // 로켓이 라인을 따라 이동 (라인 위에서)
                runner
                  .transition()
                  .duration(2000)
                  .ease(d3.easeLinear)
                  .attrTween("transform", () => {
                    return function (t: number) {
                      const point = currentLine.getPointAtLength(t * pathLength);
                      return `translate(${point.x}, ${point.y - 15})`; // 라인 위 15px
                    };
                  })
                  .on("end", () => {
                    // 라인 스타일 복원
                    d3.select(currentLine).style("stroke-dasharray", "none").attr("stroke-width", 4);

                    currentLineIndex += 1;
                    animateNextLine();
                  });
              }
            }
          } else {
            // 모든 라인 완료 후 로켓 숨기기
            runner
              .transition()
              .duration(500)
              .style("opacity", 0)
              .on("end", function () {
                d3.select(this).remove();
              });
          }
        };

        // 애니메이션 시작
        setTimeout(() => {
          animateNextLine();
        }, 500);
      }
    }

    // 노드 하이라이트 (더 강하게)
    dots
      .attr("fill-opacity", (d: ReleaseContributorActivity) => (d.contributorName === contributorName ? 1 : 0.1))
      .attr("stroke-width", (d: ReleaseContributorActivity) => (d.contributorName === contributorName ? 3 : 0))
      .attr("stroke", "rgba(255, 255, 255, 1)");

    // 라벨 하이라이트 (더 강하게)
    labelGroups
      .selectAll<SVGTextElement, ReleaseContributorActivity>(".contributor-label")
      .style("fill", (d) => (d.contributorName === contributorName ? "#e06091" : "#444"))
      .style("font-weight", (d) => (d.contributorName === contributorName ? "800" : "400"))
      .style("font-size", (d) => (d.contributorName === contributorName ? "12px" : "10px"));
  };

  // 라인 클릭 이벤트
  flowLines.on("click", (_event: MouseEvent, d) => {
    highlightContributor(d.contributorName);
  });

  // 갭 라인 호버 이벤트
  gapLines
    .on("mouseover", function (event: MouseEvent, d: ReleaseGapLineData) {
      // 선택된 contributor의 갭 라인만 호버 가능
      if (selectedContributor !== d.contributorName) return;

      if (tooltipHideTimer) {
        clearTimeout(tooltipHideTimer);
        tooltipHideTimer = null;
      }
      if (tooltipShowTimer) {
        clearTimeout(tooltipShowTimer);
        tooltipShowTimer = null;
      }

      // 라인 강조 (더 강하게)
      d3.select(this).attr("stroke-opacity", 1).attr("stroke-width", 4);

      // 배경 원도 강조
      gapIconBackgrounds
        .filter((bg: ReleaseGapLineData) => bg.contributorName === d.contributorName)
        .style("opacity", 1);

      // 건너뛴 릴리즈 정보 생성
      const skippedReleaseTags = d.skippedReleases
        .map((releaseIndex) => releaseTagsByIndex.get(releaseIndex) || `Release ${releaseIndex}`)
        .join(", ");

      // 툴팁 위치 계산
      const pathElement = event.target as SVGPathElement;
      const midPoint = pathElement.getPointAtLength(pathElement.getTotalLength() / 2);

      const ownerSvgElement = pathElement.ownerSVGElement;
      if (!ownerSvgElement) return;
      const svgPoint = ownerSvgElement.createSVGPoint();
      svgPoint.x = midPoint.x;
      svgPoint.y = midPoint.y;
      const ctm = pathElement.getScreenCTM();
      if (!ctm) return;
      const screenPoint = svgPoint.matrixTransform(ctm);

      tooltip
        .style("display", "inline-block")
        .style("left", `${screenPoint.x}px`)
        .style("top", `${screenPoint.y}px`)
        .style("transform", "translateX(-50%)")
        .style("opacity", "0")
        .style("transition", "opacity 0.2s ease-in-out").html(`
          <div class="contributor-activity-tooltip">
            <p><strong>${d.contributorName}</strong></p>
            <p style="color: #888;">🌙 Taking a break</p>
            <p style="font-size: 11px; color: #666;">Skipped: ${skippedReleaseTags}</p>
          </div>
        `);

      tooltipShowTimer = setTimeout(() => {
        tooltip.style("opacity", "1");
        tooltipShowTimer = null;
      }, 10);
    })
    .on("mouseout", function (_event: MouseEvent, d: ReleaseGapLineData) {
      if (tooltipShowTimer) {
        clearTimeout(tooltipShowTimer);
        tooltipShowTimer = null;
      }
      if (tooltipHideTimer) {
        clearTimeout(tooltipHideTimer);
        tooltipHideTimer = null;
      }

      // 라인 원래대로
      d3.select(this).attr("stroke-opacity", 0.8).attr("stroke-width", 3);

      // 배경 원도 원래대로
      gapIconBackgrounds
        .filter((bg: ReleaseGapLineData) => bg.contributorName === d.contributorName)
        .style("opacity", 0.9);

      tooltip.style("opacity", "0");
      tooltipHideTimer = setTimeout(() => {
        tooltip.style("display", "none");
        tooltipHideTimer = null;
      }, 200);
    });

  // 갭 라인 클릭 이벤트
  gapLines.on("click", (_event: MouseEvent, d: ReleaseGapLineData) => {
    highlightContributor(d.contributorName);
  });

  // 노드 클릭 이벤트
  dots.on("click", (_event: MouseEvent, d: ReleaseContributorActivity) => {
    highlightContributor(d.contributorName);
  });

  // 라벨 클릭 이벤트
  labelGroups.style("cursor", "pointer").on("click", (_event: MouseEvent, d: ReleaseContributorActivity) => {
    highlightContributor(d.contributorName);
  });

  // 배경 클릭 시 하이라이트 해제
  svg.on("click", (event: MouseEvent) => {
    const target = event.target as SVGElement;
    if (target.tagName === "svg") {
      clearHighlight();
    }
  });
};
