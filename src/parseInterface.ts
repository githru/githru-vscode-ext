interface commitList {
    // basic: 일반 commit
    // merge: merge commit
    Type: string;
    // basic : [현재 commit hash, parent commit hash]
    // merge: [현재 commit hash, ,main stem에 위치한 commit hash, branched stem에 위치한 commit hash]
    commit: string[];
    Author: string;
    AuthorEmail: string;
    AuthorDate: string;
    Committer: string;
    CommitterEmail: string;
    CommitDate: string;
    message: string;
    // 파일 변경 사항
    fileChanged: object[];
}
  
interface fileChanged {
    directory: object[];
}

interface directory {
    // 추가 라인 수
    addition: number;
    // 삭제 라인 수
    deletion: number;
}