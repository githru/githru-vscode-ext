import type { GlobalProps, CommitNode, ClusterNode, SelectedDataProps } from "types";
import { getAuthorProfileImgSrc } from "utils/author";

import type { AuthSrcMap, Cluster } from "./Summary.type";

function tagToNumber(tag: string, maxLength: number) {
  return Number(tag.replace(/[v.]/g, "").padEnd(maxLength, "0"));
}

// 클러스터 커밋들의 태그들을 비교해서 가장 최근의 tag version을 가져온다.
function getCommitLatestTag(tags: string[]) {
  let latestTag = "";

  if (tags) {
    const maxTagLength = tags.reduce((maxLength, tag) => {
      const tmp = tag.replace(/[v.]/g, "");
      return maxLength <= tmp.length ? tmp.length : maxLength;
    }, 0);

    let tagFormatNum = 0;
    const latestTagIndex = tags.reduce((latestTagIdx, tag, idx) => {
      const currnetTagNum = tagToNumber(tag, maxTagLength);
      if (currnetTagNum >= tagFormatNum) {
        tagFormatNum = currnetTagNum;
        return idx;
      }
      return latestTagIdx;
    }, 0);
    latestTag = tags[latestTagIndex];
  }
  return latestTag;
}

export function getInitData(data: GlobalProps["data"]): Cluster[] {
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
      latestReleaseTag: "",
    };

    const clusterTags: string[] = [];

    clusterNode.commitNodeList.map((commitNode: CommitNode) => {
      // set names
      const authorSet: Set<string> = new Set();
      commitNode.commit.author.names.map((name) => {
        authorSet.add(name.trim());
        return name.trim();
      });

      cluster.summary.authorNames.push(Array.from(authorSet));

      // get releaseTags in cluster commitNodeList
      commitNode.commit.releaseTags?.map((tag) => {
        clusterTags.push(tag);
        return clusterTags;
      });

      return commitNode;
    });

    // set latset release tag
    const latestReleaseTag = getCommitLatestTag(clusterTags);
    cluster.latestReleaseTag = latestReleaseTag;

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

export async function getAuthSrcMap(data: ClusterNode[]) {
  const authorNames = getAuthorNames(data);
  const promiseAuthSrc = authorNames.map(getAuthorProfileImgSrc);
  const authSrcs = await Promise.all(promiseAuthSrc);
  const authSrcMap: AuthSrcMap = {};
  authSrcs.forEach((authorInfo) => {
    const { name, src } = authorInfo;
    authSrcMap[name] = src;
  });
  return authSrcMap;
}
