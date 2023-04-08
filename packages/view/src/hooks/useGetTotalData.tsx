import { useState, useEffect } from "react";
import { container } from "tsyringe";

import type { ClusterNode, GlobalProps } from "types";
import type IDEPort from "ide/IDEPort";

export const useGetTotalData = (): GlobalProps => {
  console.log("useGetTotalData loaded");
  const [data, setData] = useState<ClusterNode[]>([]);
  const ide: IDEPort = container.resolve("IDEPort");

  useEffect(() => {
    ide.sendFetchAnalyzedDataCommand();
    // if (window.isProduction) {
    //   setData(window.githruData as ClusterNode[]);
    // } else {
    //   setData(fakeData as unknown as ClusterNode[]);
    // }
    // const onReceiveClusterNodes = (e: EngineVSCodeMessageEvent): void => {
    //   if (e.data.command !== "refresh") return;
    //   setData(JSON.parse(e.data.message));
    // };
    // window.addEventListener("message", onReceiveClusterNodes);
    // return () => window.removeEventListener("message", onReceiveClusterNodes);
  }, [ide]);

  return { data, setData };
};
