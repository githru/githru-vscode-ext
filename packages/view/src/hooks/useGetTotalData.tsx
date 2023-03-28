import { useState, useEffect } from "react";

import type { ClusterNode, GlobalProps, VSMessageEvent } from "types";

import fakeData from "../fake-assets/cluster-nodes.json";

export const useGetTotalData = (): GlobalProps => {
  const [data, setData] = useState<ClusterNode[]>([]);

  // TODO - NEED to move to independent area

  useEffect(() => {
    if (window.isProduction) {
      setData(window.githruData as ClusterNode[]);
    } else {
      setData(fakeData as unknown as ClusterNode[]);
    }

    const onReceiveClusterNodes = (e: VSMessageEvent): void => {
      if (e.data.command !== "refresh") return;
      setData(JSON.parse(e.data.payload));
    };
    window.addEventListener("message", onReceiveClusterNodes);

    return () => window.removeEventListener("message", onReceiveClusterNodes);
  }, []);

  return { data, setData };
};
