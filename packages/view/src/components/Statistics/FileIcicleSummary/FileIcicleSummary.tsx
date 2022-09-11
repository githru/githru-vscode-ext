import * as d3 from "d3";
import type { HierarchyRectangularNode } from "d3";
import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";

const FILE_PATH = "/fileChanges.json";
const WIDTH = 600;
const HEIGHT = 400;
const FONT_SIZE = 10;
const MAX_DEPTH = 4;
const SINGLE_RECT_WIDTH = WIDTH / MAX_DEPTH;
const LABEL_VISIBLE_HEIGHT = 16;
const COLOR_CODE = {
  dir: "#ffcc80",
  file: "#ffe082",
};

type TFileData = {
  name: string; // Name of file/directory.
  value?: number; // Count of changed lines.
  authors: Record<
    string,
    {
      insertion: number;
      deletions: number;
      count: number;
    }
  >;
  children: TFileData[];
};

const partition = (data: TFileData) => {
  const root = d3
    .hierarchy(data)
    // Initialize data - mutating before draw file icicle tree
    // https://github.com/d3/d3-hierarchy/blob/v3.1.2/README.md#hierarchy
    // https://observablehq.com/@d3/visiting-a-d3-hierarchy#count
    .sum((d) => d?.value ?? 0)
    .sort((a, b) => b.height - a.height || (b.value ?? 0) - (a.value ?? 0));
  return d3
    .partition<TFileData>()
    .size([HEIGHT, ((root.height + 1) * WIDTH) / MAX_DEPTH])(root);
};

const labelVisible = (d: HierarchyRectangularNode<TFileData>) =>
  d.y1 <= WIDTH && d.y0 >= 0 && d.x1 - d.x0 > LABEL_VISIBLE_HEIGHT;

const rectHeight = (d: HierarchyRectangularNode<TFileData>) =>
  d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2);

// Refer https://observablehq.com/@d3/zoomable-icicle
const drawIcicleTree = async (
  $target: RefObject<SVGSVGElement>,
  data: TFileData
) => {
  let focus: HierarchyRectangularNode<TFileData> | null = null;
  const root = partition(data);

  const svg = d3
    .select($target.current)
    .attr("viewBox", [0, 0, WIDTH, HEIGHT])
    .style("font", `${FONT_SIZE}px sans-serif`);

  // Position each partitions
  const cell = svg
    .selectAll("g")
    .data(root.descendants())
    .join("g")
    // Hide root node
    .attr("transform", (d) => `translate(${d.y0 - SINGLE_RECT_WIDTH},${d.x0})`);

  // Draw rect of partition
  const rect = cell
    .append("rect")
    .attr("width", (d) => d.y1 - d.y0 - 1)
    .attr("height", (d) => rectHeight(d))
    // directory don't have value field
    .style(
      "fill",
      (d) => COLOR_CODE[d.data.value !== undefined ? "file" : "dir"]
    )
    .style("cursor", "pointer");

  // Append labels
  const text = cell
    .append("text")
    .style("user-select", "none")
    .attr("pointer-events", "none")
    .attr("x", 4)
    .attr("y", 13)
    .attr("fill-opacity", (d) => +labelVisible(d));

  text.append("tspan").text((d) => d.data.name);

  const tspan = text
    .append("tspan")
    .attr("fill-opacity", (d) => +labelVisible(d) * 0.7)
    .text((d) => ` ${d.value?.toLocaleString()}`);

  rect.on("click", (_event, p) => {
    const positionMap = new WeakMap();
    // When users click the focused node, change focus to its parent
    const targetNode = focus === p ? p.parent : p;

    if (targetNode === null) {
      return;
    }

    focus = targetNode;
    const isRootFocused = focus.depth === 0;

    root.each((d) => {
      positionMap.set(d, {
        x0: ((d.x0 - targetNode.x0) / (targetNode.x1 - targetNode.x0)) * HEIGHT,
        x1: ((d.x1 - targetNode.x0) / (targetNode.x1 - targetNode.x0)) * HEIGHT,
        y0: d.y0 - targetNode.y0 - (isRootFocused ? SINGLE_RECT_WIDTH : 0),
        y1: d.y1 - targetNode.y0 - (isRootFocused ? SINGLE_RECT_WIDTH : 0),
      });
    });

    const t = cell
      .transition()
      .duration(750)
      .attr(
        "transform",
        (d) => `translate(${positionMap.get(d).y0},${positionMap.get(d).x0})`
      );

    rect.transition(t).attr("height", (d) => rectHeight(positionMap.get(d)));
    text
      .transition(t)
      .attr("fill-opacity", (d) => +labelVisible(positionMap.get(d)));
    tspan
      .transition(t)
      .attr("fill-opacity", (d) => +labelVisible(positionMap.get(d)) * 0.7);
  });
};

const destroyIcicleTree = ($target: RefObject<SVGSVGElement>) => {
  d3.select($target.current).selectAll("svg").remove();
};

const FileIcicleSummary = () => {
  const [data, setData] = useState<TFileData>();
  const $summary = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const getFileData = async () => {
      const response = await d3.json<TFileData>(FILE_PATH);
      setData(response);
    };

    getFileData();
  }, []);

  useEffect(() => {
    if (data) {
      drawIcicleTree($summary, data);
    }

    // cleanup
    return () => {
      destroyIcicleTree($summary);
    };
  }, [data]);

  return (
    <div>
      FileIcicleSummary
      <svg ref={$summary} />
    </div>
  );
};

export default FileIcicleSummary;
