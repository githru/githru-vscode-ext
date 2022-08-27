export type Directory = {
  // 추가 라인 수
  insertions: number;
  // 삭제 라인 수
  deletions: number;
};

export type FileChanged = {
  directory: Directory;
};

export type CommitList = {
  // basic: 일반 commit
  // merge: merge commit
  type: string;
  // basic : [현재 commit hash, parent commit hash]
  // merge: [현재 commit hash, ,main stem에 위치한 commit hash, branched stem에 위치한 commit hash]
  commitId: string;
  parentIdList: string[];
  author: string;
  authorEmail: string;
  authorDate: string;
  committer: string;
  committerEmail: string;
  commitDate: string;
  message: string;
  fileChanged: FileChanged;
  branches: string[];
};
