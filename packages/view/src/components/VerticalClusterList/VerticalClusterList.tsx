import type { GlobalProps } from "types/global";

import { ClusterGraph } from "components/VerticalClusterList/ClusterGraph";

const VerticalClusterList = ({ data }: GlobalProps) => {
  return (
    <div>
      <ClusterGraph data={data} />
    </div>
  );
};

export default VerticalClusterList;
