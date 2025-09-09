import { useEffect, useRef, useMemo, useState } from "react";
import * as d3 from "d3";
import { useShallow } from "zustand/react/shallow";

import { useDataStore } from "store";

import { processNetworkGraphData } from "./NetworkGraph.util";
import type { NetworkNode, NetworkLink } from "./NetworkGraph.type";
import { CHARGE_STRENGTH, DIMENSIONS, DISTANCE, LINK_STRENGTH } from "./NetworkGraph.const";
import "./NetworkGraph.scss";

const NetworkGraph = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<NetworkNode, undefined> | null>(null);
  const [data] = useDataStore(useShallow((state) => [state.data]));
  const [nodeType, setNodeType] = useState<"contributor" | "file" | "both">("both");

  const networkData = useMemo(() => {
    return processNetworkGraphData(data, nodeType);
  }, [data, nodeType]);

  const dragstarted = (event: d3.D3DragEvent<SVGGElement, NetworkNode, NetworkNode>, d: NetworkNode) => {
    if (!event.active) simulationRef.current?.alphaTarget(0.3).restart();
    const node = d;
    node.fx = node.x;
    node.fy = node.y;
  };

  const dragged = (event: d3.D3DragEvent<SVGGElement, NetworkNode, NetworkNode>, d: NetworkNode) => {
    const node = d;
    node.fx = event.x;
    node.fy = event.y;
  };

  const dragended = (event: d3.D3DragEvent<SVGGElement, NetworkNode, NetworkNode>, d: NetworkNode) => {
    if (!event.active) simulationRef.current?.alphaTarget(0);

    const node = d;
    node.fx = null;
    node.fy = null;
  };

  useEffect(() => {
    if (!svgRef.current || !networkData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const chartWidth = DIMENSIONS.width - DIMENSIONS.margin.left - DIMENSIONS.margin.right;
    const chartHeight = DIMENSIONS.height - DIMENSIONS.margin.top - DIMENSIONS.margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${DIMENSIONS.margin.left},${DIMENSIONS.margin.top})`);

    const defs = svg.append("defs");

    const nodeGradient = defs
      .append("radialGradient")
      .attr("id", "node-gradient")
      .attr("cx", "30%")
      .attr("cy", "30%")
      .attr("r", "70%");

    nodeGradient.append("stop").attr("offset", "0%").attr("stop-color", "#4a9eff").attr("stop-opacity", 0.8);
    nodeGradient.append("stop").attr("offset", "100%").attr("stop-color", "#1a1a2e").attr("stop-opacity", 0.6);

    const linkGradient = defs
      .append("linearGradient")
      .attr("id", "link-gradient")
      .attr("gradientUnits", "userSpaceOnUse");

    linkGradient.append("stop").attr("offset", "0%").attr("stop-color", "#4a9eff").attr("stop-opacity", 0.3);
    linkGradient.append("stop").attr("offset", "100%").attr("stop-color", "#61dafb").attr("stop-opacity", 0.1);

    const { nodes, links, colorScale } = networkData;

    const simulation = d3
      .forceSimulation<NetworkNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<NetworkNode, NetworkLink>(links)
          .id((d: NetworkNode) => d.id)
          .distance(DISTANCE)
          .strength(LINK_STRENGTH)
      )
      .force("charge", d3.forceManyBody().strength(CHARGE_STRENGTH))
      .force("center", d3.forceCenter(chartWidth / 2, chartHeight / 2))
      .force(
        "collision",
        d3.forceCollide<NetworkNode>().radius((d: NetworkNode) => d.radius + 5)
      );

    simulationRef.current = simulation;

    const link = g
      .append("g")
      .attr("class", "links")
      .selectAll<SVGLineElement, NetworkLink>("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "url(#link-gradient)")
      .attr("stroke-width", (d: NetworkLink) => Math.max(1, d.weight * 3))
      .style("opacity", 0.6)
      .style("cursor", "pointer");

    const node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll<SVGGElement, NetworkNode>(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .call(
        d3
          .drag<SVGGElement, NetworkNode, NetworkNode>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    node
      .append("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => colorScale(d.type))
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0 0 8px rgba(74, 158, 255, 0.3))");

    node
      .append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .style("fill", "#ffffff")
      .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.8)")
      .text((d) => {
        const text = d.id.length > 12 ? `${d.id.substring(0, 10)}...` : d.id;
        return text;
      });

    node
      .on("mouseover", function (event, d) {
        d3.selectAll(".network-tooltip").remove();
        d3.select(this)
          .select("circle")
          .attr("r", d.radius * 1.3)
          .style("filter", "drop-shadow(0 0 15px rgba(74, 158, 255, 0.6))");

        g.selectAll("line").style("opacity", 0.2);
        (g.selectAll("line") as d3.Selection<SVGLineElement, NetworkLink, SVGGElement, unknown>)
          .filter((l: NetworkLink) => l.source.id === d.id || l.target.id === d.id)
          .style("opacity", 0.8)
          .attr("stroke-width", (l: NetworkLink) => Math.max(2, l.weight * 4));

        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "network-tooltip")
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.9)")
          .style("color", "white")
          .style("padding", "12px")
          .style("border-radius", "8px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .style("z-index", "1000")
          .style("border", `3px solid ${colorScale(d.type)}`)
          .style("box-shadow", `0 0 20px ${colorScale(d.type)}`);

        const typeText = d.type === "contributor" ? "👤 Contributors" : "📁 Files";

        tooltip
          .html(
            `<div style="font-weight: bold; margin-bottom: 4px;">${typeText}</div>
            <div> ${d.id}</div>
          `
          )
          .style("left", `${event.pageX + 15}px`)
          .style("top", `${event.pageY - 10}px`);
      })
      .on("mouseout", function (_, d) {
        d3.select(this)
          .select("circle")
          .attr("r", d.radius)
          .style("filter", "drop-shadow(0 0 8px rgba(74, 158, 255, 0.3))");

        (g.selectAll("line") as d3.Selection<SVGLineElement, NetworkLink, SVGGElement, unknown>)
          .style("opacity", 0.6)
          .attr("stroke-width", (l: NetworkLink) => Math.max(1, l.weight * 3));

        d3.selectAll(".network-tooltip").remove();
      });

    simulation.on("tick", () => {
      link
        .attr("x1", (d: NetworkLink) => d.source.x ?? 0)
        .attr("y1", (d: NetworkLink) => d.source.y ?? 0)
        .attr("x2", (d: NetworkLink) => d.target.x ?? 0)
        .attr("y2", (d: NetworkLink) => d.target.y ?? 0);

      node.attr("transform", (d: NetworkNode) => `translate(${d.x},${d.y})`);
    });

    const legendGroup = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${DIMENSIONS.width - 250}, 50)`);

    legendGroup
      .append("rect")
      .attr("width", 150)
      .attr("height", 100)
      .attr("rx", 12)
      .style("fill", "rgba(15, 23, 42, 0.95)")
      .style("stroke", "rgba(59, 130, 246, 0.4)")
      .style("stroke-width", 1.5)
      .style("backdrop-filter", "blur(10px)")
      .style("box-shadow", "0 8px 32px rgba(0, 0, 0, 0.3)");

    const nodeTypeOptions = [
      { value: "both", label: "All Nodes" },
      { value: "contributor", label: "Contributors" },
      { value: "file", label: "Files" },
    ];

    nodeTypeOptions.forEach((option, i) => {
      const optionGroup = legendGroup.append("g").attr("transform", `translate(20, ${25 + i * 22})`);

      optionGroup
        .append("circle")
        .attr("r", 6)
        .attr("cx", 0)
        .attr("cy", 0)
        .style("fill", nodeType === option.value ? "#3b82f6" : "transparent")
        .style("stroke", "#3b82f6")
        .style("stroke-width", 2);

      if (nodeType === option.value) {
        optionGroup.append("circle").attr("r", 3).attr("cx", 0).attr("cy", 0).style("fill", "#ffffff");
      }

      optionGroup
        .append("text")
        .attr("x", 18)
        .attr("y", 4)
        .style("font-size", "12px")
        .style("fill", "#e2e8f0")
        .style("font-weight", nodeType === option.value ? "600" : "400")
        .text(option.label);

      optionGroup.style("cursor", "pointer").on("click", () => {
        setNodeType(option.value as "contributor" | "file" | "both");
      });
    });

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [networkData, nodeType]);

  return (
    <div className="contributor-timeline">
      {networkData && (
        <svg
          ref={svgRef}
          width={DIMENSIONS.width}
          height={DIMENSIONS.height}
          className="network-graph__graph"
        />
      )}
    </div>
  );
};

export default NetworkGraph;
