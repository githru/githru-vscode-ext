import type { GlobalProps } from "types";

import { ClocLineChart } from "./ClocLineChart";
import { CommitLineChart } from "./CommitLineChart";

const TemporalFilter = ({ data }: GlobalProps) => {
  // console.log(data);
  // return <>TemporalFilter</>;
  const refinedData = data; // 정제해야하는 데이터

  return (
    <>
      <ClocLineChart data={refinedData} />
      <CommitLineChart data={refinedData} />
    </>
  );
};

export default TemporalFilter;
