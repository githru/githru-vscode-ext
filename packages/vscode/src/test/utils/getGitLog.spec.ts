import * as cp from "child_process";

import { getGitLog } from "../../utils/git.util";

const mockGitLogData = `
commit 1234567890abcdef1234567890abcdef12345678 (HEAD -> main, origin/main, origin/HEAD)
Author: Mock User <mock@example.com>
AuthorDate: Mon Sep 20 21:42:00 2023 +0000
Commit: Mock Committer <committer@example.com>
CommitDate: Mon Sep 20 21:43:00 2023 +0000

    Initial commit

:100644 100644 bcd1234... 0123456... M  README.md
:100755 100755 0123456... 789abcd... A  script.sh
:000000 100644 0000000... 0123456... D  old_file.txt

commit abcdef1234567890abcdef1234567890abcdef12 (tag: v1.0.0)
Author: Release Manager <release@example.com>
AuthorDate: Tue Sep 21 18:00:00 2023 +0000
Commit: Release Manager <release@example.com>
CommitDate: Tue Sep 21 18:01:00 2023 +0000

    Release version 1.0.0

:100644 100644 abcd123... efgh456... M  src/main.js
:100644 100644 bcde234... fghi567... M  src/utils.js

commit 0987654321fedcba0987654321fedcba09876543 (feature-branch)
Author: Feature Developer <feature@example.com>
AuthorDate: Wed Sep 22 10:00:00 2023 +0000
Commit: Feature Developer <feature@example.com>
CommitDate: Wed Sep 22 10:01:00 2023 +0000

    Implement new feature

:100644 100644 0123456... 789abcd... M  src/feature.js
:000000 100644 0000000... 1234567... A  src/new_file.js
:100644 100644 2345678... 3456789... M  docs/feature_docs.md

commit fedcba0987654321fedcba0987654321fedcba09 (origin/feature-branch)
Author: Feature Developer <feature@example.com>
AuthorDate: Thu Sep 23 11:30:00 2023 +0000
Commit: Feature Developer <feature@example.com>
CommitDate: Thu Sep 23 11:31:00 2023 +0000

    Refactor feature implementation

:100644 100644 4567890... 5678901... M  src/feature.js
:100644 100644 6789012... 7890123... M  src/new_file.js
:100644 100644 7890123... 8901234... M  docs/feature_docs.md

commit 5678901234abcdef5678901234abcdef56789012 (hotfix-branch)
Author: Hotfix Developer <hotfix@example.com>
AuthorDate: Fri Sep 24 15:00:00 2023 +0000
Commit: Hotfix Developer <hotfix@example.com>
CommitDate: Fri Sep 24 15:01:00 2023 +0000

    Apply hotfix for critical bug

:100644 100644 789abcd... 890efgh... M  src/critical_fix.js
:100644 100644 890abcd... 901efgh... M  src/main.js

commit 234567890abcdef234567890abcdef234567890 (HEAD -> main)
Merge: 0987654 fedcba0
Author: Merge Bot <merge@example.com>
AuthorDate: Sat Sep 25 12:00:00 2023 +0000
Commit: Merge Bot <merge@example.com>
CommitDate: Sat Sep 25 12:01:00 2023 +0000

    Merge feature-branch into main

:100644 100644 2345678... 3456789... M  src/feature.js
:100644 100644 3456789... 4567890... M  src/new_file.js
:100644 100644 4567890... 5678901... M  docs/feature_docs.md

commit abcdef0123456789abcdef0123456789abcdef01 (tag: v1.1.0)
Author: Release Manager <release@example.com>
AuthorDate: Sun Sep 26 14:00:00 2023 +0000
Commit: Release Manager <release@example.com>
CommitDate: Sun Sep 26 14:01:00 2023 +0000

    Release version 1.1.0 with new feature

:100644 100644 def0123... abc4567... M  src/main.js
:100644 100644 cde1234... bcd5678... M  src/feature.js
:100644 100644 fgh4567... ijk7890... M  docs/release_notes.md
`;

jest.mock("child_process");

const mockSpawn = cp.spawn as jest.Mock;

mockSpawn.mockImplementation(() => {
  return {
    stdout: {
      on: jest.fn((event, callback) => {
        if (event === "data") {
          callback(Buffer.from(mockGitLogData));
        }
        if (event === "close") {
          callback();
        }
      }),
    },
    stderr: {
      on: jest.fn((event, callback) => {
        callback(Buffer.from("mocked error message"));
      }),
    },
    on: jest.fn((event, callback) => {
      if (event === "exit") {
        callback(0);
      }
    }),
  };
});

describe("getGitLog util test with mock data", () => {
  it("should return the correct git log output", async () => {
    const result = await getGitLog("git", "/mocked/path/to/repo");

    expect(result).toContain("commit 1234567890abcdef1234567890abcdef12345678");
    expect(result).toContain("Author: Mock User <mock@example.com>");
    expect(result).toContain("Commit: Mock Committer <committer@example.com>");
    expect(result).toContain("Initial commit");
    expect(result).toContain("README.md");
    expect(result).toContain("script.sh");
    expect(result).toContain("old_file.txt");

    expect(result).toContain("commit abcdef1234567890abcdef1234567890abcdef12 (tag: v1.0.0)");
    expect(result).toContain("Author: Release Manager <release@example.com>");
    expect(result).toContain("Release version 1.0.0");
    expect(result).toContain("src/main.js");
    expect(result).toContain("src/utils.js");

    expect(result).toContain("commit 0987654321fedcba0987654321fedcba09876543 (feature-branch)");
    expect(result).toContain("Author: Feature Developer <feature@example.com>");
    expect(result).toContain("Implement new feature");
    expect(result).toContain("src/feature.js");
    expect(result).toContain("src/new_file.js");
    expect(result).toContain("docs/feature_docs.md");

    expect(result).toContain("commit fedcba0987654321fedcba0987654321fedcba09 (origin/feature-branch)");
    expect(result).toContain("Refactor feature implementation");
    expect(result).toContain("src/feature.js");
    expect(result).toContain("src/new_file.js");
    expect(result).toContain("docs/feature_docs.md");

    expect(result).toContain("commit 5678901234abcdef5678901234abcdef56789012 (hotfix-branch)");
    expect(result).toContain("Author: Hotfix Developer <hotfix@example.com>");
    expect(result).toContain("Apply hotfix for critical bug");
    expect(result).toContain("src/critical_fix.js");
    expect(result).toContain("src/main.js");

    expect(result).toContain("commit 234567890abcdef234567890abcdef234567890 (HEAD -> main)");
    expect(result).toContain("Merge feature-branch into main");
    expect(result).toContain("src/feature.js");
    expect(result).toContain("src/new_file.js");
    expect(result).toContain("docs/feature_docs.md");

    expect(result).toContain("commit abcdef0123456789abcdef0123456789abcdef01 (tag: v1.1.0)");
    expect(result).toContain("Author: Release Manager <release@example.com>");
    expect(result).toContain("Release version 1.1.0 with new feature");
    expect(result).toContain("src/main.js");
    expect(result).toContain("src/feature.js");
    expect(result).toContain("docs/release_notes.md");
  });
});
