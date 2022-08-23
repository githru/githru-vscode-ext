import { CommitDAGMapper, type CommitDAG } from "./dag";

import type { CommitRaw } from "./NodeTypes.temp";

describe("dag", () => {
  let commitDAGMapper: CommitDAGMapper;

  beforeAll(() => {
    commitDAGMapper = new CommitDAGMapper();
  });

  it("CommitRaw[] 를 전달받아, CommitDAG 를 반환한다", () => {
    // given
    const commitRaws: CommitRaw[] = [];
    const expectingCommitDAG: CommitDAG = {} as any;

    // when
    const commitDAG = commitDAGMapper.mapFrom(commitRaws);

    // then
    expect(commitDAG).toBeDefined();
    expect(commitDAG).toEqual(expectingCommitDAG);
  });
});
