import type { GlobalProps } from "types";

const TemporalFilter = ({ data }: GlobalProps) => {
  if (!data) {
    console.log(data);
  }
  return <div className="temporal-filter">TemporalFilter</div>;
};

export default TemporalFilter;
