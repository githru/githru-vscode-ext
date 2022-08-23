import type { CommitRaw } from "./NodeTypes.temp";

export interface CommitDAG {
  parents: CommitDAG[] | null;
  data: CommitRaw;
}

export class CommitDAGMapper {
  mapFrom(commitRaws: CommitRaw[]): CommitDAG {
    // ...

    console.log(commitRaws);

    return {} as CommitDAG;
  }
}

export default CommitDAGMapper;
