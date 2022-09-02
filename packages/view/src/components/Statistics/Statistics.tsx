import type { GlobalProps } from "types";

import { AuthorBarChart } from "./AuthorBarChart";

const Statistics = ({ data }: GlobalProps) => {
  return (
    <div>
      <AuthorBarChart data={data} />
    </div>
  );
};

export default Statistics;
