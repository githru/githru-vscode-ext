import type { ComponentPropsWithoutRef } from "react";

export interface GithubIssueLinkProps
  extends Omit<ComponentPropsWithoutRef<"a">, "href" | "target" | "rel" | "children"> {
  owner: string;
  repo: string;
  issueNumber: string;
}
