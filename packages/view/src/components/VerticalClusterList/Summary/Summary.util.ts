import md5 from "md5";

import type { GlobalProps, CommitNode, ClusterNode, SelectedDataProps } from "types";
import { getAuthorProfileImgSrc } from "utils/author";
import { GRAVATA_URL } from "constants/constants";

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
export function getCommitLatestTag(tags: string[]): string {
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
    const { message } = clusterNode.commitNodeList[0].commit;
    const messageLines = message.split("\n");
    const title = messageLines[0];
    const cluster: Cluster = {
      clusterId: clusterNode.commitNodeList[0].clusterId,
      summary: {
        authorNames: [],
        content: {
          message: message,
          title: title,
          count: clusterNode.commitNodeList.length - 1,
        },
      },
      clusterTags: [],
    };

    const clusterTags: string[] = [];
    const authorNameSet: Set<string> = new Set();

    clusterNode.commitNodeList.forEach((commitNode: CommitNode) => {
      // set names
      commitNode.commit.author.names.forEach((name) => {
        authorNameSet.add(name.trim());
      });

      // get releaseTags in cluster commitNodeList
      commitNode.commit.releaseTags?.map((tag) => {
        if (clusterTags.indexOf(tag) === -1) {
          clusterTags.push(tag);
        }
        return clusterTags;
      });
    });
    cluster.summary.authorNames.push(Array.from(authorNameSet) as string[]);

    // set release tag in cluster
    cluster.clusterTags = clusterTags;

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

  // 각 author에 대해 이미지 로드 시도, 실패 시 fallback 제공
  const promiseAuthSrc = authorNames.map((name) =>
    getAuthorProfileImgSrc(name).catch(() => ({
      name,
      src: `${GRAVATA_URL}/${md5(name)}?d=identicon&f=y`,
    }))
  );

  const authSrcs = await Promise.all(promiseAuthSrc);
  const authSrcMap: AuthSrcMap = {};

  authSrcs.forEach((authorInfo) => {
    const { name, src } = authorInfo;
    authSrcMap[name] = src;
  });

  // 혹시 누락된 author가 있다면 fallback 제공
  authorNames.forEach((name) => {
    if (!authSrcMap[name]) {
      authSrcMap[name] = `${GRAVATA_URL}/${md5(name)}?d=identicon&f=y`;
    }
  });

  return authSrcMap;
}
