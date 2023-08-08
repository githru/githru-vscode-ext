import md5 from "md5";

import type { GlobalProps, CommitNode, ClusterNode, SelectedDataProps } from "types";

import { GITHUB_URL, GRAVATA_URL } from "./Summary.const";
import type { AuthSrcMap, Cluster, SrcInfo } from "./Summary.type";

export function getInitData(data: GlobalProps["data"]) {
  const clusters: Cluster[] = [];

  data.map((clusterNode) => {
    const { message } = clusterNode.commitNodeList[0].commit;

    const resultMsg = message.split("/n/n")[0];
    const cluster: Cluster = {
      clusterId: clusterNode.commitNodeList[0].clusterId,
      summary: {
        authorNames: [],
        content: {
          message: resultMsg,
          count: clusterNode.commitNodeList.length - 1,
        },
      },
    };

    clusterNode.commitNodeList.map((commitNode: CommitNode) => {
      // set names
      const authorSet: Set<string> = new Set();
      commitNode.commit.author.names.map((name) => {
        authorSet.add(name.trim());
        return name.trim();
      });

      cluster.summary.authorNames.push(Array.from(authorSet));

      return commitNode;
    });

    // remove name overlap
    const authorsSet = cluster.summary.authorNames.reduce((set, authorArray) => {
      authorArray.forEach((author) => {
        set.add(author);
      });
      return set;
    }, new Set());

    cluster.summary.authorNames = [];
    cluster.summary.authorNames.push(Array.from(authorsSet) as string[]);
    clusters.push(cluster);
    return cluster;
  });

  return clusters;
}

export function getClusterById(clusters: ClusterNode[], clusterId: number) {
  return clusters.filter((cluster) => cluster.commitNodeList[0].clusterId === clusterId)[0];
}

export function getClusterIds(selectedData: SelectedDataProps) {
  if (selectedData.length === 0) return [];
  return selectedData.map((selected) => selected.commitNodeList[0].clusterId);
}

function getAuthorNames(data: ClusterNode[]) {
  const clusterNodes = getInitData(data);
  const authorNames = clusterNodes.map((clusterNode) => clusterNode.summary.authorNames.flat()).flat();
  const setAuthorNames = new Set(authorNames);
  return Array.from(setAuthorNames);
}

function getAuthorProfileImgSrc(authorName: string): Promise<SrcInfo> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const { src } = img;
      const srcInfo = {
        key: authorName,
        value: src,
      };
      resolve(srcInfo);
    };

    img.onerror = () => {
      img.src = `${GRAVATA_URL}/${md5(authorName)}}?d=identicon&f=y`;
    };

    img.src = `${GITHUB_URL}/${authorName}.png?size=30`;
  });
}

export async function getAuthSrcMap(data: ClusterNode[]) {
  const authorNames = getAuthorNames(data);
  const promiseAuthSrc = authorNames.map(getAuthorProfileImgSrc);
  const authSrcs = await Promise.all(promiseAuthSrc);
  const authSrcMap: AuthSrcMap = {};
  authSrcs.forEach((srcInfo) => {
    const { key, value } = srcInfo;
    authSrcMap[key] = value;
  });
  return authSrcMap;
}
