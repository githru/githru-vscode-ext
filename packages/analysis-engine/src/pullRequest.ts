import { CommitNode, CommitRaw, PullRequest } from "./types";

// eslint-disable-next-line import/prefer-default-export
export const convertPRCommitsToCommitNodes = (
  baseCommit: CommitRaw,
  pr: PullRequest
): CommitNode[] =>
  pr.commitDetails.data.map((commitDetail) => {
    const {
      sha,
      parents,
      commit: { author, committer, message },
      files,
    } = commitDetail;

    let totalInsertionCount = 0;
    let totalDeletionCount = 0;
    const fileDictionary =
      files?.reduce((dict, f) => {
        totalInsertionCount += f.additions;
        totalDeletionCount += f.deletions;
        return {
          ...dict,
          [f.filename]: {
            insertionCount: f.additions,
            deletionCount: f.deletions,
          },
        };
      }, {}) ?? {};

    const prCommitRaw: CommitRaw = {
      sequence: -1, // ignore
      id: sha,
      parents: parents.map((p) => p.sha),
      branches: [], // ignore
      tags: [], // ignore
      author: {
        name: author?.name ?? "",
        email: author?.email ?? "",
      },
      authorDate: author?.date ? new Date(author.date) : baseCommit.authorDate,
      committer: {
        name: committer?.name ?? "",
        email: committer?.email ?? "",
      },
      committerDate: committer?.date
        ? new Date(committer.date)
        : baseCommit.committerDate,
      message,
      differenceStatistic: {
        fileDictionary,
        totalInsertionCount,
        totalDeletionCount,
      },
      commitMessageType: "",
    };

    return { commit: prCommitRaw } as CommitNode;
  });

export const convertPRInfoToCommitRaw = (
  baseCommit: CommitRaw,
  pr: PullRequest
): CommitRaw => {
  const {
    data: { title, body, additions, deletions },
  } = pr.detail;

  return {
    ...baseCommit,
    message: `${title}\n\n${body}`,
    differenceStatistic: {
      fileDictionary: {},
      totalInsertionCount: additions,
      totalDeletionCount: deletions,
    },
  };
};
