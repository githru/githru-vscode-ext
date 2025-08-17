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
