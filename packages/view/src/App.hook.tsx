import { useState, useEffect } from "react";

import type { ClusterNode, GlobalProps } from "types";

export const useGetTotalData = (): GlobalProps => {
  const [data, setData] = useState<ClusterNode[]>([]);

  useEffect(() => {
    fetch("/fake-assets/sampleClusterNodeList.json")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return { data };
};
