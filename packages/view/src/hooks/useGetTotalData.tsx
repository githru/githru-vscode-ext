import { useState, useEffect } from "react";

import type { ClusterNode, GlobalProps } from "types";

import fakeData from "../fake-assets/cluster-nodes.json";

export const useGetTotalData = (): GlobalProps => {
  const [data, setData] = useState<ClusterNode[]>([]);

  useEffect(() => {
    console.log("isProduction = ", window.isProduction);

    if (window.isProduction) {
      setData(window.githruData as ClusterNode[]);
    } else {
      setData(fakeData as unknown as ClusterNode[]);
    }
  }, []);

  return { data };
};
