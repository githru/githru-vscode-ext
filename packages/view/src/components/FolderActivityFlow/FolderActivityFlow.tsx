import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useDataStore } from "store";
import { pxToRem } from "utils/pxToRem";

import { getTopFolders, type FolderActivity } from "./FolderActivityFlow.analyzer";
import { getSubFolders, getReleaseSubFolders } from "./FolderActivityFlow.subfolder";
import { DIMENSIONS } from "./FolderActivityFlow.const";
import type { ReleaseGroup } from "./FolderActivityFlow.releaseAnalyzer";
import "./FolderActivityFlow.scss";
import type { ContributorActivity, ReleaseContributorActivity } from "./FolderActivityFlow.type";
import {
  analyzeReleaseBasedFolders,
  calculateNodePosition,
  calculateReleaseNodePosition,
  extractContributorActivities,
  extractReleaseBasedContributorActivities,
  findFirstContributorNodes,
  findFirstReleaseContributorNodes,
  generateFlowLineData,
  generateFlowLinePath,
  generateReleaseFlowLineData,
  generateReleaseFlowLinePath,
} from "./FolderActivityFlow.util";

const FolderActivityFlow = () => {
  const [totalData] = useDataStore(useShallow((state) => [state.data]));

  console.log("🚀 [FolderActivityFlow] Rendered with totalData:", totalData);

  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [topFolders, setTopFolders] = useState<FolderActivity[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [folderDepth, setFolderDepth] = useState<number>(1);

  // 릴리즈 모드 관련 state
  const [isReleaseMode, setIsReleaseMode] = useState<boolean>(false);
  const [releaseGroups, setReleaseGroups] = useState<ReleaseGroup[]>([]);
  const [releaseTopFolderPaths, setReleaseTopFolderPaths] = useState<string[]>([]);

  // 로그 헬퍼 함수
  const logDataFlow = (message: string, data?: any) => {
    console.log(`[FolderActivityFlow] ${message}`, data);
  };

  // 릴리즈 모드 토글 핸들러
  const handleModeToggle = () => {
    logDataFlow(`🔄 Mode toggle: ${isReleaseMode ? "cluster" : "release"} -> ${isReleaseMode ? "release" : "cluster"}`);
    setIsReleaseMode(!isReleaseMode);
    setCurrentPath("");
    setFolderDepth(1);
  };

  // 폴더 클릭 처리
  const handleFolderClick = (folderPath: string) => {
    logDataFlow(`📁 Folder clicked: ${folderPath} in ${isReleaseMode ? "release" : "cluster"} mode`);

    if (folderPath === ".") {
      logDataFlow("❌ Root folder clicked, ignoring");
      return;
    }

    if (isReleaseMode) {
      // Release mode: getReleaseSubFolders 사용
      const subFolderPaths = getReleaseSubFolders(totalData, folderPath);
      logDataFlow(`🔍 Found ${subFolderPaths.length} release subfolders for path: ${folderPath}`, subFolderPaths);

      if (subFolderPaths.length > 0) {
        logDataFlow(`📂 Navigating to folder: ${folderPath}, depth: ${folderDepth} -> ${folderDepth + 1}`);
        setCurrentPath(folderPath);
        setFolderDepth(folderDepth + 1);
        setReleaseTopFolderPaths(subFolderPaths);
      } else {
        logDataFlow("⚠️ No release subfolders found, staying at current level");
      }
    } else {
      // Cluster mode: getSubFolders 사용
      const subFolders = getSubFolders(totalData, folderPath);
      logDataFlow(`🔍 Found ${subFolders.length} cluster subfolders for path: ${folderPath}`, subFolders);

      if (subFolders.length > 0) {
        logDataFlow(`📂 Navigating to folder: ${folderPath}, depth: ${folderDepth} -> ${folderDepth + 1}`);
        setCurrentPath(folderPath);
        setFolderDepth(folderDepth + 1);
        setTopFolders(subFolders);
      } else {
        logDataFlow("⚠️ No cluster subfolders found, staying at current level");
      }
    }
  };

  // 상위 폴더로 이동
  const handleGoUp = () => {
    logDataFlow(`⬆️ Going up from: ${currentPath} in ${isReleaseMode ? "release" : "cluster"} mode`);

    if (currentPath === "") {
      logDataFlow("❌ Already at root, cannot go up");
      return;
    }

    const parentPath = currentPath.includes("/") ? currentPath.substring(0, currentPath.lastIndexOf("/")) : "";

    logDataFlow(`📍 Parent path calculated: "${parentPath}"`);

    if (parentPath === "") {
      logDataFlow("🏠 Returning to root level");
      setCurrentPath("");
      setFolderDepth(1);

      if (isReleaseMode) {
        const flatData = totalData.flat();
        const releaseResult = analyzeReleaseBasedFolders(flatData, 8, 1);
        logDataFlow(`📊 Root release folders loaded:`, releaseResult.topFolderPaths);
        setReleaseTopFolderPaths(releaseResult.topFolderPaths);
      } else {
        const rootFolders = getTopFolders(totalData.flat(), 8, 1);
        logDataFlow(`📊 Root cluster folders loaded:`, rootFolders);
        setTopFolders(rootFolders);
      }
    } else {
      logDataFlow(`📂 Moving to parent: ${parentPath}, depth: ${folderDepth} -> ${Math.max(1, folderDepth - 1)}`);
      setCurrentPath(parentPath);
      setFolderDepth(Math.max(1, folderDepth - 1));

      if (isReleaseMode) {
        const subFolderPaths = getReleaseSubFolders(totalData, parentPath);
        logDataFlow(`📊 Parent release subfolders loaded:`, subFolderPaths);
        setReleaseTopFolderPaths(subFolderPaths);
      } else {
        const subFolders = getSubFolders(totalData, parentPath);
        logDataFlow(`📊 Parent cluster subfolders loaded:`, subFolders);
        setTopFolders(subFolders);
      }
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    logDataFlow(`🍞 Breadcrumb clicked: index ${index} in ${isReleaseMode ? "release" : "cluster"} mode`);

    if (index === 0) {
      logDataFlow("🏠 Breadcrumb: returning to root");
      setCurrentPath("");
      setFolderDepth(1);

      if (isReleaseMode) {
        const flatData = totalData.flat();
        const releaseResult = analyzeReleaseBasedFolders(flatData, 8, 1);
        logDataFlow("📊 Breadcrumb: root release folders loaded:", releaseResult.topFolderPaths);
        setReleaseTopFolderPaths(releaseResult.topFolderPaths);
      } else {
        const folders = getTopFolders(totalData, 8, 1);
        logDataFlow("📊 Breadcrumb: root cluster folders loaded:", folders);
        setTopFolders(folders);
      }
    } else if (index < getBreadcrumbs().length - 1) {
      const pathParts = currentPath.split("/");
      const targetPath = pathParts.slice(0, index).join("/");
      logDataFlow(`📂 Breadcrumb: navigating to ${targetPath}, depth: ${folderDepth} -> ${index + 1}`);
      setCurrentPath(targetPath);
      setFolderDepth(index + 1);

      if (isReleaseMode) {
        const subFolderPaths = getReleaseSubFolders(totalData, targetPath);
        logDataFlow("📊 Breadcrumb: release subfolders loaded:", subFolderPaths);
        setReleaseTopFolderPaths(subFolderPaths);
      } else {
        const subFolders = getSubFolders(totalData, targetPath);
        logDataFlow("📊 Breadcrumb: cluster subfolders loaded:", subFolders);
        setTopFolders(subFolders);
      }
    } else {
      logDataFlow("❌ Breadcrumb: clicked on current level, ignoring");
    }
  };

  useEffect(() => {
    logDataFlow(`🔄 First useEffect triggered - totalData changed`);

    // totalData 기본 정보 로그
    logDataFlow(`📊 TotalData basic info:`, {
      exists: !!totalData,
      length: totalData?.length || 0,
      type: Array.isArray(totalData) ? "array" : typeof totalData,
    });

    if (totalData && totalData.length > 0) {
      // totalData 구조 상세 분석
      const firstItem = totalData[0];
      logDataFlow(`🔍 TotalData structure analysis:`, {
        firstItemType: typeof firstItem,
        firstItemKeys: firstItem && typeof firstItem === "object" ? Object.keys(firstItem) : "N/A",
        isNestedArray: Array.isArray(firstItem),
        nestedArrayLength: Array.isArray(firstItem) ? firstItem.length : "N/A",
      });

      // 평탄화된 데이터 분석
      const flatData = totalData.flat();
      logDataFlow(`📊 Flattened data analysis:`, {
        originalLength: totalData.length,
        flattenedLength: flatData.length,
        sampleItem: flatData[0]
          ? {
              type: typeof flatData[0],
              keys: flatData[0] && typeof flatData[0] === "object" ? Object.keys(flatData[0]).slice(0, 10) : "N/A",
            }
          : "No items",
      });

      // 데이터 내용 샘플링
      if (flatData.length > 0 && flatData[0] && typeof flatData[0] === "object") {
        const sample = flatData[0];
        logDataFlow(`🎯 Data sample structure:`, {
          hasAuthor: "author" in sample || "contributorName" in sample,
          hasDate: "date" in sample || "commitDate" in sample,
          hasFiles: "files" in sample || "filePaths" in sample,
          hasCluster: "cluster" in sample || "clusterIndex" in sample,
          allKeys: Object.keys(sample),
        });
      }
    }

    if (!totalData || totalData.length === 0) {
      logDataFlow("❌ No totalData available, skipping initialization");
      return;
    }

    // 루트 폴더로 초기화
    if (currentPath === "") {
      logDataFlow("🏠 Initializing with root folders");
      const flatData = totalData.flat();
      logDataFlow(`📊 Processing ${flatData.length} items for folder analysis`);

      // 클러스터 모드 데이터 초기화
      const folders = getTopFolders(flatData, 8, 1);
      logDataFlow("📁 Initial root folders:", {
        count: folders.length,
        folders: folders.map((f) => ({
          path: f.folderPath,
          totalChanges: f.totalChanges,
          commitCount: f.commitCount,
          insertions: f.insertions,
          deletions: f.deletions,
        })),
      });
      setTopFolders(folders);

      // 릴리즈 모드 데이터 초기화
      logDataFlow("🏷️ Initializing release-based analysis");
      const releaseResult = analyzeReleaseBasedFolders(flatData, 8, 1);
      logDataFlow("📊 Release analysis result:", {
        releaseGroupCount: releaseResult.releaseGroups.length,
        topFolderCount: releaseResult.topFolderPaths.length,
        releaseGroups: releaseResult.releaseGroups.map((g) => ({
          tag: g.releaseTag,
          commitCount: g.commitCount,
          dateRange: g.dateRange,
        })),
      });
      setReleaseGroups(releaseResult.releaseGroups);
      setReleaseTopFolderPaths(releaseResult.topFolderPaths);
    } else {
      logDataFlow(`📂 Not at root (currentPath: ${currentPath}), skipping initialization`);
    }
  }, [totalData]);

  useEffect(() => {
    logDataFlow(`🎨 Second useEffect triggered - rendering visualization`);
    logDataFlow(`📊 Render conditions:`, {
      totalDataExists: !!totalData,
      totalDataLength: totalData?.length || 0,
      isReleaseMode,
      topFoldersLength: topFolders.length,
      releaseGroupsLength: releaseGroups.length,
      releaseTopFolderPathsLength: releaseTopFolderPaths.length,
      currentPath,
      folderDepth,
    });

    if (!totalData || totalData.length === 0) {
      logDataFlow("❌ No totalData available, skipping visualization");
      return;
    }

    // 모드별 데이터 체크
    if (isReleaseMode) {
      if (releaseGroups.length === 0 || releaseTopFolderPaths.length === 0) {
        logDataFlow("❌ Insufficient release data for rendering, skipping visualization");
        return;
      }
    } else if (topFolders.length === 0) {
      logDataFlow("❌ Insufficient cluster data for rendering, skipping visualization");
      return;
    }

    const svg = d3.select(svgRef.current).attr("width", DIMENSIONS.width).attr("height", DIMENSIONS.height);

    svg.selectAll("*").remove();

    // 모드별 기여자 활동 데이터 추출
    logDataFlow(
      `🔍 Extracting contributor activities for path: "${currentPath}" in ${isReleaseMode ? "release" : "cluster"} mode`
    );

    if (isReleaseMode) {
      // 릴리즈 모드: releaseTopFolderPaths 기반
      // currentPath가 비어있으면 1, 아니면 현재 depth를 사용
      const currentDepth = currentPath === "" ? 1 : currentPath.split("/").length + 1;
      const releaseContributorActivities = extractReleaseBasedContributorActivities(
        totalData,
        releaseTopFolderPaths,
        currentDepth
      );
      logDataFlow(`🏷️ Release contributor activities extracted:`, {
        count: releaseContributorActivities.length,
        contributors: Array.from(new Set(releaseContributorActivities.map((a) => a.contributorName))),
        releases: Array.from(new Set(releaseContributorActivities.map((a) => a.releaseTag))),
        folders: Array.from(new Set(releaseContributorActivities.map((a) => a.folderPath))),
      });

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
    } else {
      // 클러스터 모드: 기존 로직
      console.log("📊 [Cluster Mode] === Data Analysis Start ===");
      console.log("📊 [Cluster Mode] totalData:", totalData);
      console.log("📊 [Cluster Mode] topFolders:", topFolders);
      console.log("📊 [Cluster Mode] currentPath:", currentPath);

      const contributorActivities = extractContributorActivities(totalData, topFolders, currentPath);

      console.log("📊 [Cluster Mode] contributorActivities count:", contributorActivities.length);
      console.log("📊 [Cluster Mode] contributorActivities sample (first 5):", contributorActivities.slice(0, 5));
      console.log(
        "📊 [Cluster Mode] unique contributors:",
        Array.from(new Set(contributorActivities.map((a) => a.contributorName)))
      );
      console.log(
        "📊 [Cluster Mode] unique clusters:",
        Array.from(new Set(contributorActivities.map((a) => a.clusterIndex))).sort()
      );
      console.log(
        "📊 [Cluster Mode] unique folders:",
        Array.from(new Set(contributorActivities.map((a) => a.folderPath)))
      );
      console.log("📊 [Cluster Mode] === Data Analysis End ===");

      logDataFlow(`👥 Cluster contributor activities extracted:`, {
        count: contributorActivities.length,
        contributors: Array.from(new Set(contributorActivities.map((a) => a.contributorName))),
        clusters: Array.from(new Set(contributorActivities.map((a) => a.clusterIndex))).sort(),
        folders: Array.from(new Set(contributorActivities.map((a) => a.folderPath))),
      });

      if (contributorActivities.length === 0) {
        svg
          .append("text")
          .attr("x", DIMENSIONS.width / 2)
          .attr("y", DIMENSIONS.height / 2)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .text("No activity data available for this folder")
          .style("font-size", "14px")
          .style("fill", "#6c757d");
        return;
      }

      renderClusterVisualization(svg, contributorActivities);
    }
  }, [totalData, topFolders, isReleaseMode, releaseGroups, releaseTopFolderPaths]);

  // 클러스터 모드 렌더링 함수
  const renderClusterVisualization = (svg: any, contributorActivities: ContributorActivity[]) => {
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

    const colorScale = d3.scaleOrdinal().domain(uniqueContributors).range(d3.schemeCategory10);

    const mainGroup = svg.append("g");

    // 폴더 레인 그리기
    mainGroup
      .selectAll(".folder-lane")
      .data(topFolders)
      .enter()
      .append("g")
      .attr("class", "folder-lane")
      .each(function (this: SVGGElement, d: FolderActivity) {
        const lane = d3.select(this);

        lane
          .append("rect")
          .attr("class", "lane-background")
          .attr("x", DIMENSIONS.margin.left)
          .attr("y", yScale(d.folderPath) || 0)
          .attr("width", DIMENSIONS.width - DIMENSIONS.margin.left - DIMENSIONS.margin.right)
          .attr("height", yScale.bandwidth())
          .attr("fill", "#f8f9fa")
          .attr("stroke", "#dee2e6")
          .attr("stroke-width", 1);

        lane
          .append("text")
          .attr("class", "folder-label clickable")
          .attr("x", DIMENSIONS.width - DIMENSIONS.margin.right + 10)
          .attr("y", (yScale(d.folderPath) || 0) + yScale.bandwidth() / 2)
          .attr("text-anchor", "start")
          .attr("dominant-baseline", "middle")
          .text(() => {
            if (d.folderPath === ".") return "root";

            const fileName = d.folderPath.includes("/") ? d.folderPath.split("/").pop() : d.folderPath;

            return fileName && fileName.length > 15 ? `${fileName.substring(0, 12)}...` : fileName || "unknown";
          })
          .style("font-size", "12px")
          .style("fill", "#495057")
          .style("font-weight", "500")
          .style("cursor", "pointer")
          .on("click", () => {
            if (d.folderPath !== ".") {
              handleFolderClick(d.folderPath);
            }
          })
          .on("mouseover", function () {
            d3.select(this).style("fill", "#007bff");
          })
          .on("mouseout", function () {
            d3.select(this).style("fill", "#495057");
          });
      });

    // 클러스터 축
    const xAxis = d3.axisBottom(xScale).tickFormat((d: any) => `Cluster ${parseInt(d) + 1}`);

    mainGroup
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${DIMENSIONS.height - DIMENSIONS.margin.bottom})`)
      .call(xAxis as any);

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
      .attr("fill-opacity", 0.8)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);

    // 툴팁 이벤트
    dots
      .on("mouseover", (event: any, d: ContributorActivity) => {
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
      .on("mousemove", (event: any) => {
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
      .style("fill", "#495057")
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
      .attr("d", (d: any) => generateFlowLinePath(d, xScale, yScale))
      .attr("fill", "none")
      .attr("stroke", (d: any) => colorScale(d.contributorName) as string)
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.4);
  };

  // 릴리즈 모드 렌더링 함수
  const renderReleaseVisualization = (svg: any, releaseContributorActivities: ReleaseContributorActivity[]) => {
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
          .attr("class", "folder-label clickable")
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
          .style("font-weight", "500")
          .style("cursor", "pointer")
          .on("click", () => {
            if (folderPath !== ".") {
              handleFolderClick(folderPath);
            }
          })
          .on("mouseover", function () {
            d3.select(this).style("fill", "#007bff");
          })
          .on("mouseout", function () {
            d3.select(this).style("fill", "#495057");
          });
      });

    // 릴리즈 축
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat((d: any) => releaseTagsByIndex.get(parseInt(d)) || `Release ${parseInt(d)}`);

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
      activitiesByRelease.get(activity.releaseIndex)!.push(activity);
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
      .on("mouseover", (event: any, d: ReleaseContributorActivity) => {
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
      .on("mousemove", (event: any) => {
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
        (d: ReleaseContributorActivity) =>
          (yScale(d.folderPath) || 0) + yScale.bandwidth() / 2 - sizeScale(d.changes) - 5
      )
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "bottom")
      .text((d: ReleaseContributorActivity) => d.contributorName)
      .style("font-size", "10px")
      .style("fill", "#495057")
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
      .attr("d", (d: any) => generateReleaseFlowLinePath(d, xScale, yScale))
      .attr("fill", "none")
      .attr("stroke", (d: any) => colorScale(d.contributorName) as string)
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.4);
  };

  // 브레드크럼 생성
  const getBreadcrumbs = () => {
    if (currentPath === "") {
      logDataFlow("🍞 Breadcrumbs: at root level");
      return ["root"];
    }

    const parts = currentPath.split("/");
    const breadcrumbs = ["root"];
    let current = "";

    parts.forEach((part) => {
      current = current ? `${current}/${part}` : part;
      breadcrumbs.push(part);
    });

    logDataFlow(`🍞 Breadcrumbs generated:`, { currentPath, breadcrumbs });
    return breadcrumbs;
  };

  return (
    <div className="folder-activity-flow">
      <div className="folder-activity-flow__header">
        <div>
          <p className="folder-activity-flow__title">Contributors Folder Activity Flow</p>
          <div className="folder-activity-flow__subtitle">
            {isReleaseMode
              ? "Contributors moving between folders across releases"
              : "Contributors moving between top folders over time"}
          </div>
        </div>
        <button
          className="folder-activity-flow__mode-toggle"
          onClick={handleModeToggle}
          style={{
            padding: "8px 16px",
            backgroundColor: isReleaseMode ? "#28a745" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          {isReleaseMode ? "📋 Release Mode" : "🔗 Cluster Mode"}
        </button>
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
