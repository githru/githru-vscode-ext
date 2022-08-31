import { useState, useEffect } from "react";

import type { ClusterNode } from "types/NodeTypes.temp";

export const useGetTotalData = () => {
  const [data, setData] = useState<ClusterNode[]>([]);
  useEffect(() => {
    fetch("/fake-assets/sampleClusterNodeList.json")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return { data };
};
