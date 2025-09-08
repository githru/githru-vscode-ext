import * as d3 from "d3";

import type { ClusterNode } from "types";

export interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  type: "contributor" | "file";
  radius: number;
  weight: number;
  connections: number;
}

export interface NetworkLink extends d3.SimulationLinkDatum<NetworkNode> {
  source: NetworkNode;
  target: NetworkNode;
  weight: number;
  sourceType: "contributor" | "file";
  targetType: "contributor" | "file";
}

export interface NetworkGraphData {
  nodes: NetworkNode[];
  links: NetworkLink[];
  colorScale: d3.ScaleOrdinal<string, string>;
}

export function processNetworkGraphData(
  data: ClusterNode[],
  nodeType: "contributor" | "file" | "both"
): NetworkGraphData | null {
  if (!data || data.length === 0) return null;

  const contributorStats = new Map<
    string,
    {
      commitCount: number;
      totalChangeCount: number;
      files: Set<string>;
      lastActivityDate: Date;
    }
  >();

  const fileStats = new Map<
    string,
    {
      commitCount: number;
      totalChangeCount: number;
      contributors: Set<string>;
      lastModifiedDate: Date;
    }
  >();

  const contributorFileRelations = new Map<string, Map<string, number>>();

  data.forEach((cluster) => {
    cluster.commitNodeList.forEach((commitNode) => {
      const { commit } = commitNode;
      const author = commit.author.names[0] || "Unknown";
      const commitDate = new Date(commit.authorDate);

      if (!contributorStats.has(author)) {
        contributorStats.set(author, {
          commitCount: 0,
          totalChangeCount: 0,
          files: new Set(),
          lastActivityDate: commitDate,
        });
      }

      const contributorStat = contributorStats.get(author)!;
      contributorStat.commitCount += 1;
      contributorStat.lastActivityDate =
        commitDate > contributorStat.lastActivityDate ? commitDate : contributorStat.lastActivityDate;

      if (!contributorFileRelations.has(author)) {
        contributorFileRelations.set(author, new Map());
      }

      const files = commit.diffStatistics.files || {};
      Object.entries(files).forEach(([fileName, stats]) => {
        if (!fileStats.has(fileName)) {
          fileStats.set(fileName, {
            commitCount: 0,
            totalChangeCount: 0,
            contributors: new Set(),
            lastModifiedDate: commitDate,
          });
        }

        const fileStat = fileStats.get(fileName)!;
        fileStat.commitCount += 1;
        fileStat.totalChangeCount += stats.insertions + stats.deletions;
        fileStat.contributors.add(author);
        fileStat.lastModifiedDate = commitDate > fileStat.lastModifiedDate ? commitDate : fileStat.lastModifiedDate;

        contributorStat.totalChangeCount += stats.insertions + stats.deletions;
        contributorStat.files.add(fileName);

        const authorFileMap = contributorFileRelations.get(author)!;
        authorFileMap.set(fileName, (authorFileMap.get(fileName) || 0) + 1);
      });
    });
  });

  const nodes: NetworkNode[] = [];
  const nodeMap = new Map<string, NetworkNode>();

  if (nodeType === "contributor" || nodeType === "both") {
    const topContributors = Array.from(contributorStats.entries())
      .sort(([, a], [, b]) => b.commitCount - a.commitCount)
      .slice(0, 20);

    topContributors.forEach(([author, stats]) => {
      const weight = stats.commitCount / Math.max(...Array.from(contributorStats.values()).map((s) => s.commitCount));
      const radius = Math.max(8, Math.min(25, weight * 20 + 8));
      const connections = stats.files.size;

      const node: NetworkNode = {
        id: author,
        type: "contributor",
        radius,
        weight,
        connections,
      };

      nodes.push(node);
      nodeMap.set(author, node);
    });
  }

  if (nodeType === "file" || nodeType === "both") {
    const topFiles = Array.from(fileStats.entries())
      .sort(([, a], [, b]) => b.commitCount - a.commitCount)
      .slice(0, 30);

    topFiles.forEach(([fileName, stats]) => {
      const shortFileName = fileName.split("/").pop() || fileName;
      const weight = stats.commitCount / Math.max(...Array.from(fileStats.values()).map((s) => s.commitCount));
      const radius = Math.max(6, Math.min(20, weight * 15 + 6));
      const connections = stats.contributors.size;

      const node: NetworkNode = {
        id: shortFileName,
        type: "file",
        radius,
        weight,
        connections,
      };

      nodes.push(node);
      nodeMap.set(shortFileName, node);
    });
  }

  const links: NetworkLink[] = [];

  if (nodeType === "both") {
    contributorFileRelations.forEach((fileMap, author) => {
      if (!nodeMap.has(author)) return;

      fileMap.forEach((strength, fileName) => {
        const shortFileName = fileName.split("/").pop() || fileName;
        if (!nodeMap.has(shortFileName)) return;

        const maxStrength = Math.max(...Array.from(fileMap.values()));
        const normalizedWeight = strength / maxStrength;

        const sourceNode = nodeMap.get(author)!;
        const targetNode = nodeMap.get(shortFileName)!;
        links.push({
          source: sourceNode,
          target: targetNode,
          weight: normalizedWeight,
          sourceType: "contributor",
          targetType: "file",
        });
      });
    });
  } else if (nodeType === "contributor") {
    const contributors = Array.from(contributorStats.keys());
    for (let i = 0; i < contributors.length; i += 1) {
      for (let j = i + 1; j < contributors.length; j += 1) {
        const author1 = contributors[i];
        const author2 = contributors[j];

        if (nodeMap.has(author1) && nodeMap.has(author2)) {
          const files1 = contributorStats.get(author1)!.files;
          const files2 = contributorStats.get(author2)!.files;

          const commonFiles = new Set(Array.from(files1).filter((file) => files2.has(file)));

          if (commonFiles.size > 0) {
            const maxCommonFiles = Math.max(
              ...contributors.map((c) => {
                const otherFiles = contributorStats.get(c)!.files;
                return new Set(Array.from(files1).filter((file) => otherFiles.has(file))).size;
              })
            );

            const weight = commonFiles.size / maxCommonFiles;

            if (weight > 0.1) {
              const sourceNode = nodeMap.get(author1)!;
              const targetNode = nodeMap.get(author2)!;
              links.push({
                source: sourceNode,
                target: targetNode,
                weight,
                sourceType: "contributor",
                targetType: "contributor",
              });
            }
          }
        }
      }
    }
  } else if (nodeType === "file") {
    const files = Array.from(fileStats.keys());
    for (let i = 0; i < files.length; i += 1) {
      for (let j = i + 1; j < files.length; j += 1) {
        const file1 = files[i];
        const file2 = files[j];

        const shortFileName1 = file1.split("/").pop() || file1;
        const shortFileName2 = file2.split("/").pop() || file2;

        if (nodeMap.has(shortFileName1) && nodeMap.has(shortFileName2)) {
          const contributors1 = fileStats.get(file1)!.contributors;
          const contributors2 = fileStats.get(file2)!.contributors;

          const commonContributors = new Set(Array.from(contributors1).filter((c) => contributors2.has(c)));

          if (commonContributors.size > 0) {
            const maxCommonContributors = Math.max(
              ...files.map((f) => {
                const otherContributors = fileStats.get(f)!.contributors;
                return new Set(Array.from(contributors1).filter((c) => otherContributors.has(c))).size;
              })
            );

            const weight = commonContributors.size / maxCommonContributors;

            if (weight > 0.1) {
              const sourceNode = nodeMap.get(shortFileName1)!;
              const targetNode = nodeMap.get(shortFileName2)!;
              links.push({
                source: sourceNode,
                target: targetNode,
                weight,
                sourceType: "file",
                targetType: "file",
              });
            }
          }
        }
      }
    }
  }
  const colorScale = d3.scaleOrdinal<string>().domain(["contributor", "file"]).range(["#4a9eff", "#39d353"]);

  return {
    nodes,
    links,
    colorScale,
  };
}
