import type { ClusterNode } from "types";

export const fakeFirstClusterNode: ClusterNode = {
  nodeTypeName: "CLUSTER",
  commitNodeList: [
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "1887e642bc176d7279058b6a85def88672042926",
        parentIds: ["8cf352e4107dc81c64db2a81f6605aaab92b8494"],
        author: {
          id: "no-id",
          names: ["snowy"],
          emails: ["chocoheim@gusty.local"],
        },
        committer: {
          id: "no-id",
          names: ["snowy"],
          emails: ["chocoheim@gusty.local"],
        },
        authorDate: "Sun Aug 07 2022 18:43:35 GMT+0900 (Korean Standard Time)",
        commitDate: "Sun Aug 07 2022 18:43:35 GMT+0900 (Korean Standard Time)",
        diffStatistics: {
          changedFileCount: 4,
          insertions: 125,
          deletions: 0,
          files: {
            "packages/view/src/App.tsx": {
              insertions: 12,
              deletions: 0,
            },
            "packages/view/src/index.tsx": {
              insertions: 17,
              deletions: 0,
            },
          },
        },
        message: "feat(webview): add typescript structure",
        tags: [],
        releaseTags: [],
      },
      seq: 0,
      clusterId: 0,
    },
  ],
};

export const fakeSecondClusterNode: ClusterNode = {
  nodeTypeName: "CLUSTER",
  commitNodeList: [
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "8cf352e4107dc81c64db2a81f6605aaab92b8494",
        parentIds: ["8a0d6f2df2db1ecfa09878b8e6ce2b14d8f9b142"],
        author: {
          id: "no-id",
          names: ["snowy"],
          emails: ["chocoheim@gusty.local"],
        },
        committer: {
          id: "no-id",
          names: ["snowy"],
          emails: ["chocoheim@gusty.local"],
        },
        authorDate: "Sun Aug 07 2022 18:42:21 GMT+0900 (Korean Standard Time)",
        commitDate: "Sun Aug 07 2022 18:42:21 GMT+0900 (Korean Standard Time)",
        diffStatistics: {
          changedFileCount: 12,
          insertions: 494,
          deletions: 168,
          files: {
            "package-lock.json": {
              insertions: 475,
              deletions: 1,
            },
            "packages/view/.gitignore": {
              insertions: 2,
              deletions: 0,
            },
            "packages/view/package.json": {
              insertions: 3,
              deletions: 1,
            },
          },
        },
        message: "feat(vscode): launch webview for webviewApp",
        tags: [],
        releaseTags: [],
      },
      clusterId: 1,
      seq: 1,
    },
  ],
};

export const fakeThirdClusterNode: ClusterNode = {
  nodeTypeName: "CLUSTER",
  commitNodeList: [
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "8a0d6f2df2db1ecfa09878b8e6ce2b14d8f9b142",
        parentIds: ["6b8bd11644b5ea065deab70c2852d77c2fd4f5ad"],
        author: {
          id: "no-id",
          names: ["snowy"],
          emails: ["chocoheim@gusty.local"],
        },
        committer: {
          id: "no-id",
          names: ["snowy"],
          emails: ["chocoheim@gusty.local"],
        },
        authorDate: "Sun Aug 07 2022 15:26:27 GMT+0900 (Korean Standard Time)",
        commitDate: "Sun Aug 07 2022 15:27:06 GMT+0900 (Korean Standard Time)",
        diffStatistics: {
          changedFileCount: 11,
          insertions: 481,
          deletions: 110,
          files: {
            "package-lock.json": {
              insertions: 276,
              deletions: 14,
            },
            "packages/view/package.json": {
              insertions: 7,
              deletions: 3,
            },
            "packages/view/src/reportWebVitals.js": {
              insertions: 0,
              deletions: 13,
            },
            "packages/vscode/.eslintrc.json": {
              insertions: 15,
              deletions: 7,
            },
            "packages/vscode/CHANGELOG.md": {
              insertions: 0,
              deletions: 9,
            },
          },
        },
        message: "setup(vscode): add webview loader",
        tags: [],
        releaseTags: [],
      },
      seq: 2,
      clusterId: 2,
    },
  ],
};

export const fakeFourthClusterNode: ClusterNode = {
  nodeTypeName: "CLUSTER",
  commitNodeList: [
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "8a0d6f2df2db1ecfa09878b8e6ce2b14d8f9b142",
        parentIds: ["6b8bd11644b5ea065deab70c2852d77c2fd4f5ad"],
        author: {
          id: "no-id",
          names: ["snowy"],
          emails: ["chocoheim@gusty.local"],
        },
        committer: {
          id: "no-id",
          names: ["snowy"],
          emails: ["chocoheim@gusty.local"],
        },
        authorDate: "Sun Aug 07 2022 15:26:27 GMT+0900 (Korean Standard Time)",
        commitDate: "Sun Aug 07 2022 15:27:06 GMT+0900 (Korean Standard Time)",
        diffStatistics: {
          changedFileCount: 11,
          insertions: 481,
          deletions: 110,
          files: {
            "package-lock.json": {
              insertions: 276,
              deletions: 14,
            },
            "packages/view/package.json": {
              insertions: 7,
              deletions: 3,
            },
            "packages/view/src/reportWebVitals.js": {
              insertions: 0,
              deletions: 13,
            },
            "packages/vscode/.eslintrc.json": {
              insertions: 15,
              deletions: 7,
            },
            "packages/vscode/CHANGELOG.md": {
              insertions: 0,
              deletions: 9,
            },
          },
        },
        message: "setup(vscode): add webview loader",
        tags: [],
        releaseTags: [],
      },
      seq: 2,
      clusterId: 3,
    },
  ],
};

export const fakeFifthClusterNode: ClusterNode = {
  nodeTypeName: "CLUSTER",
  commitNodeList: [
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "8a0d6f2df2db1ecfa09878b8e6ce2b14d8f9b142",
        parentIds: ["6b8bd11644b5ea065deab70c2852d77c2fd4f5ad"],
        author: {
          id: "no-id",
          names: ["snowy"],
          emails: ["chocoheim@gusty.local"],
        },
        committer: {
          id: "no-id",
          names: ["snowy"],
          emails: ["chocoheim@gusty.local"],
        },
        authorDate: "Sun Aug 07 2022 15:26:27 GMT+0900 (Korean Standard Time)",
        commitDate: "Sun Aug 07 2022 15:27:06 GMT+0900 (Korean Standard Time)",
        diffStatistics: {
          changedFileCount: 11,
          insertions: 481,
          deletions: 110,
          files: {
            "package-lock.json": {
              insertions: 276,
              deletions: 14,
            },
            "packages/view/package.json": {
              insertions: 7,
              deletions: 3,
            },
            "packages/view/src/reportWebVitals.js": {
              insertions: 0,
              deletions: 13,
            },
            "packages/vscode/.eslintrc.json": {
              insertions: 15,
              deletions: 7,
            },
            "packages/vscode/CHANGELOG.md": {
              insertions: 0,
              deletions: 9,
            },
          },
        },
        message: "setup(vscode): add webview loader",
        tags: [],
        releaseTags: [],
      },
      seq: 2,
      clusterId: 4,
    },
  ],
};

export const fakePrev: ClusterNode[] = [fakeSecondClusterNode, fakeThirdClusterNode];
export const fakePrev2: ClusterNode[] = [fakeThirdClusterNode, fakeFifthClusterNode];
export const fakePrev3: ClusterNode[] = [];
export const fakePrev4: ClusterNode[] = [fakeFifthClusterNode, fakeFirstClusterNode];

// PR 커밋 상세 정보 테스트용 모킹 데이터
export const fakePRCommitDetailClusterNode: ClusterNode = {
  nodeTypeName: "CLUSTER",
  commitNodeList: [
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "a1b2c3d4e5f6789012345678901234567890abcd",
        parentIds: [],
        author: {
          id: "user-1",
          names: ["김개발"],
          emails: ["kim.dev@example.com"],
        },
        committer: {
          id: "user-1",
          names: ["김개발"],
          emails: ["kim.dev@example.com"],
        },
        authorDate: "Mon Dec 18 2023 10:30:00 GMT+0900 (Korean Standard Time)",
        commitDate: "Mon Dec 18 2023 10:30:00 GMT+0900 (Korean Standard Time)",
        diffStatistics: {
          changedFileCount: 3,
          insertions: 150,
          deletions: 25,
          files: {
            "src/components/Detail/Detail.tsx": {
              insertions: 120,
              deletions: 20,
            },
            "src/components/Detail/Detail.scss": {
              insertions: 25,
              deletions: 5,
            },
            "src/components/Detail/Detail.type.ts": {
              insertions: 5,
              deletions: 0,
            },
          },
        },
        message:
          "feat: PR 커밋 상세 정보 표시 기능 추가\n\n- 커밋 목록 표시 기능 구현\n- 통계 정보 표시 기능 추가\n- 커밋 제목 hover 툴팁 기능 구현\n- 반응형 디자인 적용",
        tags: [],
        releaseTags: [],
      },
      seq: 0,
      clusterId: 0,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "b2c3d4e5f6789012345678901234567890abcde",
        parentIds: ["a1b2c3d4e5f6789012345678901234567890abcd"],
        author: {
          id: "user-2",
          names: ["이코더"],
          emails: ["lee.coder@example.com"],
        },
        committer: {
          id: "user-2",
          names: ["이코더"],
          emails: ["lee.coder@example.com"],
        },
        authorDate: "Mon Dec 18 2023 11:15:00 GMT+0900 (Korean Standard Time)",
        commitDate: "Mon Dec 18 2023 11:15:00 GMT+0900 (Korean Standard Time)",
        diffStatistics: {
          changedFileCount: 2,
          insertions: 80,
          deletions: 15,
          files: {
            "src/components/Detail/Detail.util.ts": {
              insertions: 60,
              deletions: 10,
            },
            "src/components/Detail/Detail.hook.tsx": {
              insertions: 20,
              deletions: 5,
            },
          },
        },
        message:
          "refactor: 커밋 상세 정보 유틸리티 함수 개선\n\n- getCommitListDetail 함수 최적화\n- 타입 안정성 향상\n- 성능 개선",
        tags: [],
        releaseTags: [],
      },
      seq: 1,
      clusterId: 0,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "c3d4e5f6789012345678901234567890abcdef",
        parentIds: ["b2c3d4e5f6789012345678901234567890abcde"],
        author: {
          id: "user-1",
          names: ["김개발"],
          emails: ["kim.dev@example.com"],
        },
        committer: {
          id: "user-1",
          names: ["김개발"],
          emails: ["kim.dev@example.com"],
        },
        authorDate: "Mon Dec 18 2023 14:45:00 GMT+0900 (Korean Standard Time)",
        commitDate: "Mon Dec 18 2023 14:45:00 GMT+0900 (Korean Standard Time)",
        diffStatistics: {
          changedFileCount: 1,
          insertions: 30,
          deletions: 5,
          files: {
            "src/components/Detail/Detail.scss": {
              insertions: 30,
              deletions: 5,
            },
          },
        },
        message: "style: 커밋 아이템 스타일링 개선\n\n- 반응형 디자인 적용\n- 접근성 개선\n- 다크모드 지원",
        tags: [],
        releaseTags: [],
      },
      seq: 2,
      clusterId: 0,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "d4e5f6789012345678901234567890abcdef1",
        parentIds: ["c3d4e5f6789012345678901234567890abcdef"],
        author: {
          id: "user-3",
          names: ["박테스터"],
          emails: ["park.tester@example.com"],
        },
        committer: {
          id: "user-3",
          names: ["박테스터"],
          emails: ["park.tester@example.com"],
        },
        authorDate: "Mon Dec 18 2023 16:20:00 GMT+0900 (Korean Standard Time)",
        commitDate: "Mon Dec 18 2023 16:20:00 GMT+0900 (Korean Standard Time)",
        diffStatistics: {
          changedFileCount: 2,
          insertions: 45,
          deletions: 8,
          files: {
            "src/components/Detail/Detail.test.tsx": {
              insertions: 35,
              deletions: 3,
            },
            "src/components/Detail/Detail.util.test.ts": {
              insertions: 10,
              deletions: 5,
            },
          },
        },
        message:
          "test: 커밋 상세 정보 컴포넌트 테스트 추가\n\n- 단위 테스트 작성\n- E2E 테스트 시나리오 추가\n- 테스트 커버리지 향상",
        tags: [],
        releaseTags: [],
      },
      seq: 3,
      clusterId: 0,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "e5f6789012345678901234567890abcdef12",
        parentIds: ["d4e5f6789012345678901234567890abcdef1"],
        author: {
          id: "user-1",
          names: ["김개발"],
          emails: ["kim.dev@example.com"],
        },
        committer: {
          id: "user-1",
          names: ["김개발"],
          emails: ["kim.dev@example.com"],
        },
        authorDate: "Mon Dec 18 2023 17:30:00 GMT+0900 (Korean Standard Time)",
        commitDate: "Mon Dec 18 2023 17:30:00 GMT+0900 (Korean Standard Time)",
        diffStatistics: {
          changedFileCount: 1,
          insertions: 20,
          deletions: 2,
          files: {
            "README.md": {
              insertions: 20,
              deletions: 2,
            },
          },
        },
        message: "docs: PR 커밋 상세 정보 기능 문서화\n\n- 사용법 가이드 추가\n- API 문서 업데이트\n- 예제 코드 추가",
        tags: [],
        releaseTags: [],
      },
      seq: 4,
      clusterId: 0,
    },
  ],
};

export const fakePRCommitDetailData: ClusterNode[] = [fakePRCommitDetailClusterNode];
