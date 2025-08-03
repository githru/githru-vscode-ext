import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

import type { DataType, GroupByType } from "./BarChart.type";

const csvPath = "/boot/raw.csv";

const BarChart = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [data, setData] = useState<DataType[]>([]);
  const [groupBy, setGroupBy] = useState<GroupByType>("source");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    d3.csv<DataType>(csvPath, d3.autoType)
      .then((raw) => {
        if (!isMounted) return;
        const parsed = raw.map((d) => ({
          source: d.source as string,
          target: d.target as string,
          value: d.value as number,
        }));
        setData(parsed);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("CSV 로딩 실패:", err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 700;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // 그룹핑 및 value 합계 계산
    const grouped = d3.rollup(
      data,
      (v) => d3.sum(v, (d) => d.value),
      (d) => d[groupBy]
    );

    const processed = Array.from(grouped, ([key, sum]) => ({ key, sum }));

    const xScale = d3
      .scaleBand()
      .domain(processed.map((d) => d.key))
      .range([0, chartWidth])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(processed, (d) => d.sum) ?? 0])
      .nice()
      .range([chartHeight, 0]);

    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end");

    g.append("g").call(d3.axisLeft(yScale));

    // 막대 그리기
    g.selectAll(".bar")
      .data(processed)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.key) ?? 0)
      .attr("y", (d) => yScale(d.sum))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => chartHeight - yScale(d.sum))
      .attr("fill", "steelblue");
  }, [data, groupBy]);

  return (
    <div>
      <label htmlFor="groupBy">
        Group by:{" "}
        <select
          id="groupBy"
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as GroupByType)}
        >
          <option value="source">Source</option>
          <option value="target">Target</option>
        </select>
      </label>

      {loading ? (
        <p>Loading CSV data...</p>
      ) : (
        <svg
          ref={svgRef}
          width={700}
          height={400}
        />
      )}
    </div>
  );
};

export default BarChart;
