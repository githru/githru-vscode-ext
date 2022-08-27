export interface Directory {
  insertions: number;
  deletions: number;
}

export interface FileChanged {
  directory: Directory;
}

export interface CommitRaw {
  // basic: 일반 commit
  // merge: merge commit
  type: string;
  id: string;
  parents: string[];
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
