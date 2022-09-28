import type { GlobalProps } from "types";

import { AuthorBarChart } from "./AuthorBarChart";
import { FileIcicleSummary } from "./FileIcicleSummary";
import "./Statistics.scss";

const Statistics = ({ data }: GlobalProps) => {
  return (
    <div className="statistics">
      <AuthorBarChart data={data} />
      <FileIcicleSummary data={data} />
    </div>
  );
};

export default Statistics;
