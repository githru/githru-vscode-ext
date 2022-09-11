import type { StatisticsProps } from "types";

import { AuthorBarChart } from "./AuthorBarChart";
import { FileIcicleSummary } from "./FileIcicleSummary";
import "./Statistics.scss";

const Statistics = ({ data }: StatisticsProps) => {
  return (
    <div className="statistics">
      <AuthorBarChart data={data} />
      <FileIcicleSummary />
    </div>
  );
};

export default Statistics;
