import { useState, useEffect } from "react";

import type { ClusterNode } from "types";

export const useGetTotalData = () => {
  const [data, setData] = useState<ClusterNode[]>([]);
  useEffect(() => {
    fetch("/fake-assets/sampleClusterNodeList.json")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return { data };
};
