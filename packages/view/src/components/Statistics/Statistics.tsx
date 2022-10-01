import { useGlobalData } from "hooks/useGlobalData";

import { AuthorBarChart } from "./AuthorBarChart";
import { FileIcicleSummary } from "./FileIcicleSummary";
import "./Statistics.scss";

const Statistics = () => {
  const { filteredData, selectedData } = useGlobalData();
  const data = (selectedData ? [selectedData] : filteredData) ?? [];
  return (
    <div className="statistics">
      <AuthorBarChart data={data} />
      <FileIcicleSummary data={data} />
    </div>
  );
};

export default Statistics;
