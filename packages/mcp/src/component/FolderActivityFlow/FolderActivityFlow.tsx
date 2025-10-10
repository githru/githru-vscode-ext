import * as d3 from "d3";
import { useCallback, useEffect, useRef } from "react";

import "./FolderActivityFlow.scss";
import type { ReleaseContributorActivity, ReleaseFlowLineData } from "./FolderActivityFlow.type";

const DIMENSIONS = {
  width: 800,
  height: 400,
  margin: { top: 40, right: 120, bottom: 60, left: 20 },
};

export interface ReleaseGroup {
  releaseTag: string;
  commitCount: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  commits: CommitData[];
}

interface CommitData {
  id: string;
  authorDate: string;
  commitDate: string;
  author: {
    id: string;
    names: string[];
    emails: string[];
  };
  diffStatistics: {
    insertions: number;
    deletions: number;
    files: { [filePath: string]: { insertions: number; deletions: number } };
  };
  releaseTags: string[];
}

const FolderActivityFlow = ({
                              releaseGroups,
                              releaseTopFolderPaths,
                              flowLineData,
                              releaseContributorActivities,
                              firstNodesByContributor,
                            }: {
  releaseGroups: ReleaseGroup[];
  releaseTopFolderPaths: string[];
  flowLineData: ReleaseFlowLineData[];
  releaseContributorActivities: ReleaseContributorActivity[];
  firstNodesByContributor: Map<string, ReleaseContributorActivity>;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const pxToRem = (px: number) => `${px / 16}rem`;

  // 릴리즈 기반 노드 위치 계산
  const calculateReleaseNodePosition = (
    activity: ReleaseContributorActivity,
    xScale: d3.ScaleBand<string>,
    activitiesByRelease: Map<number, ReleaseContributorActivity[]>
  ): number => {
    const releaseX = (xScale(String(activity.releaseIndex)) || 0) + xScale.bandwidth() / 2;
    const releaseActivities = activitiesByRelease.get(activity.releaseIndex) || [];
    const activityIndex = releaseActivities.findIndex(
      (a) =>
        a.contributorName === activity.contributorName &&
        a.folderPath === activity.folderPath &&
        a.date.getTime() === activity.date.getTime()
    );
    const offsetRange = xScale.bandwidth() * 0.8;
    const offset =
      (activityIndex - (releaseActivities.length - 1) / 2) * (offsetRange / Math.max(releaseActivities.length, 1));
    return releaseX + offset;
  };

  // 릴리즈 기반 플로우 라인 경로 생성
  const generateReleaseFlowLinePath = (
    d: ReleaseFlowLineData,
    xScale: d3.ScaleBand<string>,
    yScale: d3.ScaleBand<string>
  ): string => {
    const x1 = (xScale(String(d.startReleaseIndex)) || 0) + xScale.bandwidth() / 2;
    const y1 = (yScale(d.startFolder) || 0) + yScale.bandwidth() / 2;
    const x2 = (xScale(String(d.endReleaseIndex)) || 0) + xScale.bandwidth() / 2;
    const y2 = (yScale(d.endFolder) || 0) + yScale.bandwidth() / 2;
    const midX = (x1 + x2) / 2;
    return `M ${x1},${y1} Q ${midX},${y1} ${midX},${(y1 + y2) / 2} Q ${midX},${y2} ${x2},${y2}`;
  };

  const renderReleaseVisualization = useCallback(
    (
      svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
      // eslint-disable-next-line no-shadow
      releaseContributorActivities: ReleaseContributorActivity[]
    ) => {
      const tooltip = d3.select(tooltipRef.current);

      // scale
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

      const colorScale = d3.scaleOrdinal().domain(uniqueContributors).range(d3.schemeCategory10);

      const mainGroup = svg.append("g");

      // 폴더 레인 그리기
      mainGroup
        .selectAll(".folder-lane")
        .data(releaseTopFolderPaths)
        .enter()
        .append("g")
        .attr("class", "folder-lane")
        .each(function (this: SVGGElement, folderPath: string) {
          const lane = d3.select(this);

          lane
            .append("rect")
            .attr("class", "lane-background")
            .attr("x", DIMENSIONS.margin.left)
            .attr("y", yScale(folderPath) || 0)
            .attr("width", DIMENSIONS.width - DIMENSIONS.margin.left - DIMENSIONS.margin.right)
            .attr("height", yScale.bandwidth())
            .attr("fill", "#f8f9fa")
            .attr("stroke", "#dee2e6")
            .attr("stroke-width", 1);

          lane
            .append("text")
            .attr("class", "folder-label")
            .attr("x", DIMENSIONS.width - DIMENSIONS.margin.right + 10)
            .attr("y", (yScale(folderPath) || 0) + yScale.bandwidth() / 2)
            .attr("text-anchor", "start")
            .attr("dominant-baseline", "middle")
            .text(() => {
              if (folderPath === ".") return "root";
              const fileName = folderPath.includes("/") ? folderPath.split("/").pop() : folderPath;
              return fileName && fileName.length > 15 ? `${fileName.substring(0, 12)}...` : fileName || "unknown";
            })
            .style("font-size", "12px")
            .style("fill", "#495057")
            .style("font-weight", "500");
        });

      // 릴리즈 축
      const xAxis = d3
        .axisBottom(xScale)
        .tickFormat((d: string) => releaseTagsByIndex.get(parseInt(d, 10)) || `Release ${parseInt(d, 10)}`);

      mainGroup
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${DIMENSIONS.height - DIMENSIONS.margin.bottom})`)
        .call(xAxis as any);

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
        .attr("fill-opacity", 0.8)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1);

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
      // const firstNodesByContributor = findFirstReleaseContributorNodes(releaseContributorActivities);

      mainGroup
        .selectAll(".contributor-label")
        .data(Array.from(firstNodesByContributor.values()))
        .enter()
        .append("text")
        .attr("class", "contributor-label")
        .attr("x", (d: any) => calculateReleaseNodePosition(d, xScale, activitiesByRelease))
        .attr("y", (d: any) => (yScale(d.folderPath) || 0) + yScale.bandwidth() / 2 - sizeScale(d.changes) - 5)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "bottom")
        .text((d: any) => d.contributorName)
        .style("font-size", "10px")
        .style("fill", "#495057")
        .style("font-weight", "500")
        .style("pointer-events", "none");

      // 플로우 라인 그리기
      // const flowLineData = generateReleaseFlowLineData(releaseContributorActivities);

      mainGroup
        .selectAll(".flow-line")
        .data(flowLineData)
        .enter()
        .append("path")
        .attr("class", "flow-line")
        .attr("d", (d: any) => generateReleaseFlowLinePath(d, xScale, yScale))
        .attr("fill", "none")
        .attr("stroke", (d: any) => colorScale(d.contributorName) as string)
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0.4);
    },
    [releaseTopFolderPaths]
  );

  useEffect(() => {
    // 릴리즈 모드 데이터 체크
    if (releaseGroups.length === 0 || releaseTopFolderPaths.length === 0) {
      return;
    }
    const svg = d3
      .select(svgRef.current)
      .attr("width", DIMENSIONS.width)
      .attr("height", DIMENSIONS.height) as d3.Selection<SVGSVGElement, unknown, null, undefined>;

    svg.selectAll("*").remove();

    // // 릴리즈 모드: releaseTopFolderPaths 기반
    // const releaseContributorActivities = extractReleaseBasedContributorActivities(totalData, releaseTopFolderPaths, 1);

    if (releaseContributorActivities.length === 0) {
      svg
        .append("text")
        .attr("x", DIMENSIONS.width / 2)
        .attr("y", DIMENSIONS.height / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text("No release activity data available")
        .style("font-size", "14px")
        .style("fill", "#6c757d");
      return;
    }

    renderReleaseVisualization(svg, releaseContributorActivities);
  }, [releaseGroups, releaseTopFolderPaths, renderReleaseVisualization]);

  return (
    <div className="folder-activity-flow">
      <div className="folder-activity-flow__header">
        <div>
          <p className="folder-activity-flow__title">Contributors Folder Activity Flow</p>
          <div className="folder-activity-flow__subtitle">Contributors moving between folders across releases</div>
        </div>
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