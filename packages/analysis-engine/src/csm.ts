import type { CommitRaw } from "./types/CommitRaw";
import type { CSMDictionary, CSMNode } from "./types/CSM";

// todo: import type { StemDictionary } from "./types/STEM";
interface StemDictionary {
  [branch: string]: CommitRaw[];
}

/**
 * extract root-commits
 */
const getRootCommitStems = (stemDict: StemDictionary) =>
  Object.keys(stemDict)
    .filter((branch) => {
      const stem = stemDict[branch];
      return stem[stem.length - 1].parents.length === 0;
    })
    .map((branch) => ({ branch, stem: stemDict[branch] }));

/**
 * CSM 생성
 *
 * @param commits
 * @returns Array<Stem>
 */
export const buildCSM = (
  commitDict: Map<string, CommitRaw>,
  stemDict: StemDictionary
): CSMDictionary => {
  if (Object.values(stemDict).length === 0) {
    // throw new Error("no stem");
    return {};
  }

  /*
  const commit = {} // root-commit
  const mergedCommit = commit.parent[0]
  const stemId = mergedCommit.stemId
  const stem = stemDict[stemId]

  stem
  => head부터~ merged커밋노드까지 splice 하고
  => 이걸 CSM의 노드에 넣어줌
  => 
  */

  const csmDict: CSMDictionary = {};

  /*
    commits[0] : 가장 최근 커밋
    commits[-1] : 가장 오래된 커밋

    루트노드가 N개일수있음
    => stem 의 가장첫번째 커밋을 확인하여 parent 여부 확인
    => parent 없는 커밋을 루트노드로 취급

    루트노드부터 순회 시작 
    => if 머지커밋발견하면, 머지parent로 올라가서 해당stem 가져오기
    => 아니면 통과

    머지parent로 어떻게 찾아 올라가나..?
    => commitDict 로 찾아옴..!

    머지parent 부터 시작해서 해당 stem 어떻게 가져오나..??
    => 머지커밋id로 그에 속한 stem을 찾을수있어야함..!
   */

  const rootCommitStems = getRootCommitStems(stemDict);
  // 마스터브랜치루트 → HEAD브랜치 루트 → 서브브랜치 루트 순서대로 CSM 생성

  rootCommitStems.forEach(({ branch, stem }) => {
    const csm: CSMNode[] = [];

    stem.forEach((commit) => {
      if (commit.parents[1]) {
        const squashCommits: CommitRaw[] = [];

        // stem1 = [5, 4,           3,               2, 1, 0]
        // stem2 =       [5,4,   3,    2,1,        0]
        // stem3 =       [    4,3,          2,1,0]

        const taskQueue = [commitDict[commit.parents[1]]];
        while (taskQueue.length > 0) {
          const mergingCommit = taskQueue.shift()!;

          // prepare sqush
          const branchStem = stemDict[(mergingCommit as any).stemId];
          const branchStemLastIndex = branchStem.length - 1;
          const branchStemMergedCommitIndex = branchStem.findIndex(
            ({ id }) => id === mergingCommit.id
          );
          const commitCount =
            branchStemLastIndex - branchStemMergedCommitIndex + 1;

          // sqush
          const spliceCommits = branchStem.splice(
            branchStemLastIndex,
            commitCount
          );
          squashCommits.push(...spliceCommits);

          // nested merge
          const nestedMergingCommits = spliceCommits.filter(
            ({ parents }) => parents.length > 1
          );
          taskQueue.push(...nestedMergingCommits);
        }

        csm.push({ commits: squashCommits });
      } else {
        csm.push({ commits: [commit] });
      }
    });

    csmDict[branch] = csm;
  });

  return csmDict;
};

export const csm = () => "csm";

export default csm;
