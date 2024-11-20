import type { GlobalProps, CommitNode, ClusterNode, SelectedDataProps } from "types";
import { getAuthorProfileImgSrc } from "utils/author";

import type { AuthSrcMap, Cluster } from "./Summary.type";

/**
 * 릴리스 테그 형식이 맞는지 유효성을 확인하다.
 * @param tag
 * @returns
 */
const isValidReleaseTag = (tag: string): boolean => {
  const isValidTag = /^v\d+(\.\d+)*$/;

  if (isValidTag.test(tag)) {
    return true;
  }

  return false;
};

/**
 * 태그의 버전 이름을 숫자로 바꾼다.
 * ex) v.1.1.1 -> 111
 * @param tag
 * @param maxLength
 * @returns number
 *
 */
function tagToNumber(tag: string, maxLength: number): number {
  if (!isValidReleaseTag(tag)) return 0;
  return Number(tag.replace(/[v.]/g, "").padEnd(maxLength, "0"));
}

/**
 * 클러스터 커밋들의 태그들을 비교해서 가장 최근의 tag version을 가져온다.
 * @param tags
 * @returns
 */
function getCommitLatestTag(tags: string[]): string {
  if (!Array.isArray(tags) || tags.length === 0) return "";

  const validTags = tags.filter((tag) => isValidReleaseTag(tag));
  if (validTags.length === 0) return "";

  const maxTagLength = validTags.reduce((maxLength, tag) => {
    const tmp = tag.replace(/[v.]/g, "");
    return maxLength <= tmp.length ? tmp.length : maxLength;
  }, 0);

  let prevTagNumber = 0;
  const latestTagIndex = validTags.reduce((latestTagIdx, tag, idx) => {
    const currnetTagNumber = tagToNumber(tag, maxTagLength);
    if (currnetTagNumber >= prevTagNumber) {
      prevTagNumber = currnetTagNumber;
      return idx;
    }
    return latestTagIdx;
  }, 0);

  const latestTag = tags[latestTagIndex];

  return latestTag;
}

export function getInitData(data: GlobalProps["data"]): Cluster[] {
  const clusters: Cluster[] = [];

  data.map((clusterNode) => {
    const { commit: clusterFirstCommit, clusterId } = clusterNode.commitNodeList[0];
    const { message } = clusterFirstCommit;
    const clusterTags: string[] = [];
    const authorSet: Set<string> = new Set();

    clusterNode.commitNodeList.forEach((commitNode: CommitNode) => {
      // set names
      commitNode.commit.author.names.forEach((name) => {
        authorSet.add(name.trim());
      });

      // get releaseTags in cluster commitNodeList
      commitNode.commit.releaseTags?.forEach((tag) => {
        clusterTags.push(tag);
      });
    });

    // set latset release tag
    const latestReleaseTag = getCommitLatestTag(clusterTags);

    const cluster: Cluster = {
      clusterId: clusterId,
      summary: {
        authorNames: [Array.from(authorSet)],
        content: {
          message: message.split("/n/n")[0],
          count: clusterNode.commitNodeList.length - 1,
        },
      },
      latestReleaseTag: latestReleaseTag,
    };

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
