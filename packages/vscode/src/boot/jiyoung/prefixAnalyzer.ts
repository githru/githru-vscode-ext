import { execSync } from "child_process";

export function getCommitPrefixStats(since = "1 month ago"): string {
  const log = execSync(`git log main --since="${since}" --pretty=format:"%s"`, {
    encoding: "utf-8",
  });

  const lines = log.split("\n");
  const counts: Record<string, number> = {};

  for (const line of lines) {
    const match = line.match(/^(\w+):/);
    if (match) {
      const prefix = match[1];
      counts[prefix] = (counts[prefix] || 0) + 1;
    }
  }

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([prefix, count], idx) => `${idx + 1}. ${prefix} (${count} times)`)
    .join("\n");

  return sorted;
}
