import type { GlobalProps } from "types/global";

import type { CommitNode } from "types/NodeTypes.temp";

export function getCommitIds({ data }: GlobalProps) {
  return data.map((v) => {
    return v.commitNodeList.map((a: CommitNode) => {
      return a.commit.id;
    });
  });
}

export function getCommitAuthorNames({ data }: GlobalProps) {
  return data
    .map((v) => {
      return v.commitNodeList.map((a: CommitNode) => {
        return a.commit.author.names
          .map((b: string) => {
            return b.trim();
          })
          .join("");
      });
    })
    .map((v) => v.filter((e: string[], i: number) => v.indexOf(e) === i));
}

export function getCommitMessages({ data }: GlobalProps) {
  return data.map((v) => {
    return v.commitNodeList[v.commitNodeList.length - 1].commit.message;
  });
}
