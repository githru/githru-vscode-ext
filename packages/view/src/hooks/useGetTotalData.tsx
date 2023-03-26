import { useState, useEffect } from "react";

import type { ClusterNode, GlobalProps } from "types";

import fakeData from "../fake-assets/cluster-nodes.json";

export const useGetTotalData = (): GlobalProps => {
  const [data, setData] = useState<ClusterNode[]>([]);

  useEffect(() => {
    const onReceiveClusterNodes = (e: MessageEvent): void => {
      if (e.data.command !== "refresh") return;
      setData(JSON.parse(e.data.payload));
    };
    window.addEventListener("message", onReceiveClusterNodes);
    return () => window.removeEventListener("message", onReceiveClusterNodes);
  }, []);

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
