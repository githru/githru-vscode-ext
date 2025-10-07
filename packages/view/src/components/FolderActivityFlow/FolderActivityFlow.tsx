import { useRef, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import * as d3 from "d3";

import { useDataStore } from "store";
import { pxToRem } from "utils/pxToRem";
import { getTopFolders, type FolderActivity } from "./FolderActivityFlow.analyzer";
import { getSubFolders } from "./FolderActivityFlow.subfolder";

import { DIMENSIONS } from "./FolderActivityFlow.const";
import {
  extractContributorActivities,
  generateFlowLineData,
  calculateNodePosition,
  findFirstContributorNodes,
  generateFlowLinePath
} from "./FolderActivityFlow.util";
import type { ContributorActivity } from "./FolderActivityFlow.type";
import "./FolderActivityFlow.scss";

const FolderActivityFlow = () => {
  const [totalData] = useDataStore(
    useShallow((state) => [state.data])
  );

  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [topFolders, setTopFolders] = useState<FolderActivity[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [folderDepth, setFolderDepth] = useState<number>(1);


  // 폴더 클릭 처리
  const handleFolderClick = (folderPath: string) => {
    if (folderPath === '.') return;

    const subFolders = getSubFolders(totalData, folderPath);
    if (subFolders.length > 0) {
      setCurrentPath(folderPath);
      setFolderDepth(folderDepth + 1);
      setTopFolders(subFolders);
    }
  };

  // 상위 폴더로 이동
  const handleGoUp = () => {
    if (currentPath === "") return;

    const parentPath = currentPath.includes('/')
      ? currentPath.substring(0, currentPath.lastIndexOf('/'))
      : "";

    if (parentPath === "") {
      setCurrentPath("");
      setFolderDepth(1);
      const rootFolders = getTopFolders(totalData.flat(), 8, 1);
      setTopFolders(rootFolders);
    } else {
      setCurrentPath(parentPath);
      setFolderDepth(Math.max(1, folderDepth - 1));
      const subFolders = getSubFolders(totalData, parentPath);
      setTopFolders(subFolders);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      setCurrentPath("");
      setFolderDepth(1);
      const folders = getTopFolders(totalData, 8, 1);
      setTopFolders(folders);
    } else if (index < getBreadcrumbs().length - 1) {
      const pathParts = currentPath.split("/");
      const targetPath = pathParts.slice(0, index).join("/");
      setCurrentPath(targetPath);
      setFolderDepth(index + 1);
      const subFolders = getSubFolders(totalData, targetPath);
      setTopFolders(subFolders);
    }
  };

  useEffect(() => {
    if (!totalData || totalData.length === 0) return;

    // 루트 폴더로 초기화
    if (currentPath === "") {
      const folders = getTopFolders(totalData.flat(), 8, 1);
      setTopFolders(folders);
    }
  }, [totalData]);

  useEffect(() => {
    if (!totalData || totalData.length === 0 || topFolders.length === 0) return;

    const svg = d3.select(svgRef.current)
      .attr("width", DIMENSIONS.width)
      .attr("height", DIMENSIONS.height);

    const tooltip = d3.select(tooltipRef.current);

    svg.selectAll("*").remove();

    // 기여자 활동 데이터 추출
    const contributorActivities = extractContributorActivities(totalData, topFolders, currentPath);

    if (contributorActivities.length === 0) {
      svg.append("text")
        .attr("x", DIMENSIONS.width / 2)
        .attr("y", DIMENSIONS.height / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text("No activity data available for this folder")
        .style("font-size", "14px")
        .style("fill", "#757880");
      return;
    }

    // 스케일 설정
    const uniqueContributors = Array.from(new Set(contributorActivities.map(a => a.contributorName)));
    const uniqueClusters = Array.from(new Set(contributorActivities.map(a => a.clusterIndex))).sort((a, b) => a - b);

    const xScale = d3.scaleBand()
      .domain(uniqueClusters.map(String))
      .range([DIMENSIONS.margin.left, DIMENSIONS.width - DIMENSIONS.margin.right])
      .paddingInner(0.1);

    const yScale = d3.scaleBand()
      .domain(topFolders.map(f => f.folderPath))
      .range([DIMENSIONS.margin.top, DIMENSIONS.height - DIMENSIONS.margin.bottom])
      .paddingInner(0.2);

    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(contributorActivities, d => d.changes) || 1])
      .range([3, 12]);

    const colorScale = d3.scaleOrdinal()
      .domain(uniqueContributors)
      .range(['#e06091', '#8840bb', '#ffd08a', '#07bebe', '#456cf7', '#0687a3', '#ffcccb', '#feffd1', '#3a4776', '#aa4b72']);

    const mainGroup = svg.append("g");

    // 폴더 레이블 그리기
    mainGroup.selectAll(".folder-label")
      .data(topFolders)
      .enter()
      .append("text")
      .attr("class", "folder-label clickable")
      .attr("x", DIMENSIONS.width - DIMENSIONS.margin.right + 10)
      .attr("y", d => (yScale(d.folderPath) || 0) + yScale.bandwidth() / 2)
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "middle")
      .text(d => {
        if (d.folderPath === '.') return 'root';

        const fileName = d.folderPath.includes('/')
          ? d.folderPath.split('/').pop()
          : d.folderPath;

        return fileName && fileName.length > 15
          ? fileName.substring(0, 12) + "..."
          : fileName || 'unknown';
      })
      .style("font-size", "12px")
      .style("fill", "#b4bac6")
      .style("font-weight", "500")
      .style("cursor", "pointer")
      .on("click", (_event, d) => {
        if (d.folderPath !== '.') {
          handleFolderClick(d.folderPath);
        }
      })
      .on("mouseover", function() {
        d3.select(this).style("fill", "#e06091");
      })
      .on("mouseout", function() {
        d3.select(this).style("fill", "#b4bac6");
      });

    // 클러스터 축
    const xAxis = d3.axisBottom(xScale)
      .tickFormat((d: any) => `Cluster ${parseInt(d) + 1}`);

    mainGroup.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${DIMENSIONS.height - DIMENSIONS.margin.bottom})`)
      .call(xAxis as any);

    // 클러스터 내 노드 위치 계산
    const activitiesByCluster = new Map<number, ContributorActivity[]>();
    contributorActivities.forEach(activity => {
      if (!activitiesByCluster.has(activity.clusterIndex)) {
        activitiesByCluster.set(activity.clusterIndex, []);
      }
      activitiesByCluster.get(activity.clusterIndex)!.push(activity);
    });

    // 활동 노드 그리기
    const dots = mainGroup.selectAll(".activity-dot")
      .data(contributorActivities)
      .enter()
      .append("circle")
      .attr("class", "activity-dot")
      .attr("cx", d => calculateNodePosition(d, xScale, activitiesByCluster))
      .attr("cy", d => (yScale(d.folderPath) || 0) + yScale.bandwidth() / 2)
      .attr("r", d => sizeScale(d.changes))
      .attr("fill", d => colorScale(d.contributorName) as string)
      .attr("fill-opacity", 1)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);

    // 툴팁 이벤트
    dots.on("mouseover", (event, d) => {
        tooltip
          .style("display", "inline-block")
          .style("left", pxToRem(event.pageX + 10))
          .style("top", pxToRem(event.pageY - 10))
          .html(`
            <div class="contributor-activity-tooltip">
              <p><strong>${d.contributorName}</strong></p>
              <p>Cluster: ${d.clusterIndex + 1}</p>
              <p>Folder: ${d.folderPath === '.' ? 'root' : d.folderPath}</p>
              <p>Date: ${d.date.toLocaleDateString()}</p>
              <p>Changes: ${d.changes}</p>
              <p style="color: #28a745;">+${d.insertions} insertions</p>
              <p style="color: #dc3545;">-${d.deletions} deletions</p>
            </div>
          `);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", pxToRem(event.pageX + 10))
          .style("top", pxToRem(event.pageY - 10));
      })
      .on("mouseout", () => {
        tooltip.style("display", "none");
      });

    // 기여자별 첫 노드에 이름 라벨
    const firstNodesByContributor = findFirstContributorNodes(contributorActivities);

    mainGroup.selectAll(".contributor-label")
      .data(Array.from(firstNodesByContributor.values()))
      .enter()
      .append("text")
      .attr("class", "contributor-label")
      .attr("x", d => calculateNodePosition(d, xScale, activitiesByCluster))
      .attr("y", d => (yScale(d.folderPath) || 0) + yScale.bandwidth() / 2 - sizeScale(d.changes) - 5)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "bottom")
      .text(d => d.contributorName)
      .style("font-size", "10px")
      .style("fill", "#b4bac6")
      .style("font-weight", "500")
      .style("pointer-events", "none");

    // 플로우 라인 그리기
    const flowLineData = generateFlowLineData(contributorActivities);

    mainGroup.selectAll(".flow-line")
      .data(flowLineData)
      .enter()
      .append("path")
      .attr("class", "flow-line")
      .attr("d", d => generateFlowLinePath(d, xScale, yScale))
      .attr("fill", "none")
      .attr("stroke", d => colorScale(d.contributorName) as string)
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6);

  }, [totalData, topFolders]);

  // 브레드크럼 생성
  const getBreadcrumbs = () => {
    if (currentPath === "") return ["root"];
    const parts = currentPath.split("/");
    const breadcrumbs = ["root"];
    let current = "";

    parts.forEach(part => {
      current = current ? `${current}/${part}` : part;
      breadcrumbs.push(part);
    });

    return breadcrumbs;
  };

  return (
    <div className="folder-activity-flow">
      <p className="folder-activity-flow__title">Contributors Folder Activity Flow</p>
      <div className="folder-activity-flow__subtitle">
        Contributors moving between top folders over time
      </div>

      <div className="folder-activity-flow__breadcrumb">
        {getBreadcrumbs().map((crumb, index) => (
          <span key={crumb}>
            {index > 0 && <span className="separator"> / </span>}
            <span
              className={index === getBreadcrumbs().length - 1 ? "current" : "clickable"}
              onClick={() => handleBreadcrumbClick(index)}
            >
              {crumb}
            </span>
          </span>
        ))}
        {currentPath !== "" && (
          <button
            className="folder-activity-flow__back-btn"
            onClick={handleGoUp}
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