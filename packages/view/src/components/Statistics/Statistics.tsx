import { AuthorBarChart } from "./AuthorBarChart";
import { FileIcicleSummary } from "./FileIcicleSummary";
import "./Statistics.scss";
import type { StatisticsProps } from "./Statistics.type";

const Statistics = ({ data }: StatisticsProps) => {
  return (
    <div className="statistics">
      <AuthorBarChart data={data} />
      <FileIcicleSummary data={data} />
    </div>
  );
};

export default Statistics;
