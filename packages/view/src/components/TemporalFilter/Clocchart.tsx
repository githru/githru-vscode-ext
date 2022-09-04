// import type { GlobalProps } from "types/global";
import * as d3 from "d3";
// { data }: GlobalProps
const ClocChart = () => {
  const width = 600;
  const height = 150;
  const title = "ClocGraph";
  // const [data, setData] = useState([]);

  // const svgRef = useRef();
  const svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // x축
  const xScale = d3.scaleTime().range([0, width]).nice();
  const xAxis = d3.axisBottom(xScale);
  // .tickFormat((data) => d3.timeFormat("%a %d")("sting"));
  svg.append("g").attr("transform", `translate(0, ${height})`).call(xAxis);

  // y축
  const yScale = d3.scaleLinear().domain([0, 40]).range([height, 0]).nice();
  const yAxis = d3.axisLeft(yScale);
  svg.append("g").call(yAxis);

  return <div>{title}</div>;
};

export default ClocChart;
