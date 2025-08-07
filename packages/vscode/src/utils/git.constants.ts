export const GIT_LOG_FORMAT =
  "%n%n" +
  [
    "%H", // commit hash (id)
    "%P", // parent hashes
    "%D", // ref names (branches, tags)
    "%an", // author name
    "%ae", // author email
    "%ad", // author date
    "%cn", // committer name
    "%ce", // committer email
    "%cd", // committer date
    "%w(0,0,4)%s", // commit message subject
    "%b", // commit message body
  ].join("%n");

export const TASK_THRESHOLD = 1000;
export const CORE_COUNT_THRESHOLD = 4;
export const THREAD_COUNTS = {
  MIN: 1,
  MEDIUM: 2,
  MAX: 3,
} as const;
