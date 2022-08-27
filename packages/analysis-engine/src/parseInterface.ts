export interface FileChanged {
  directory: Directory;
}

export interface Directory {
  // 추가 라인 수
  insertions: number;
  // 삭제 라인 수
  deletions: number;
}

export interface CommitList {
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
  // view에 따라서 달라짐
  message: string[];
  // 파일 변경 사항
  fileChanged: FileChanged;
  branches: string[];
}
