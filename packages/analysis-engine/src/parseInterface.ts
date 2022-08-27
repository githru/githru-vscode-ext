export interface Directory {
  // 추가 라인 수
  insertions: number;
  // 삭제 라인 수
  deletions: number;
}

export interface FileChanged {
  directory: Directory;
}

export interface CommitList {
  // basic: 일반 commit
  // merge: merge commit
  type: string;
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
}
