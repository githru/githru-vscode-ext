import type { RestEndpointMethodTypes } from "@octokit/rest";

export interface PullRequest {
  detail: RestEndpointMethodTypes["pulls"]["get"]["response"];
  commitDetails: RestEndpointMethodTypes["pulls"]["listCommits"]["response"];
}

export interface PullRequestDictionary {
  [prNumber: string]: PullRequest;
}
