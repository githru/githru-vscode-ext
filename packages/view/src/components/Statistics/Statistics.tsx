import { AuthorBarChart } from "./AuthorBarChart";
import { FileIcicleSummary } from "./FileIcicleSummary";
import "./Statistics.scss";

const Statistics = () => {
  return (
    <div className="statistics">
      <AuthorBarChart />
      <FileIcicleSummary />
    </div>
  );
};

export default Statistics;
