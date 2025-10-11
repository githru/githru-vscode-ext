import type { OctokitOptions } from "@octokit/core/dist-types/types";
import type { ThrottlingOptions } from "@octokit/plugin-throttling/dist-types/types";
import { Octokit, type RestEndpointMethodTypes } from "@octokit/rest";

type PullsListResponseData = RestEndpointMethodTypes["pulls"]["get"]["response"];
type PullsListCommitsResponseData = RestEndpointMethodTypes["pulls"]["listCommits"]["response"];

export class PluginOctokit {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(props: {
    owner: string;
    repo: string;
    options: Partial<OctokitOptions & ThrottlingOptions>;
  }) {
    this.octokit = new Octokit({
      ...props.options,
      throttle: {
        onRateLimit: (retryAfter: any, options: { method: string; url: string; request: { retryCount: number; }; }) => {
          const {
            method,
            url,
            request: { retryCount },
          } = options as {
            method: string;
            url: string;
            request: { retryCount: number };
          };
          console.log(`[L] - request quota exhausted for request ${method} ${url}`);

          if (retryCount <= 1) {
            console.log(`[L] - retrying after ${retryAfter} seconds!`);
            return true;
          }
          return false;
        },
        onAbuseLimit: (retryAfter: any, options: { method: string; url: string; }) => {
          const { method, url } = options as { method: string; url: string };
          throw new Error(`[E] - abuse detected for request ${method} ${url} ${retryAfter}`);
        },
      },
    })

    this.owner = props.owner;
    this.repo = props.repo;
  }

  private _getPullRequest = async (pullNumber: number) => {
    const pullRequestDetail: PullsListResponseData = await this.octokit.rest.pulls.get({
      owner: this.owner,
      repo: this.repo,
      pull_number: pullNumber,
    });

    const pullRequestCommits: PullsListCommitsResponseData = await this.octokit.rest.pulls.listCommits({
      owner: this.owner,
      repo: this.repo,
      pull_number: pullNumber,
    });

    return {
      detail: pullRequestDetail,
      commitDetails: pullRequestCommits,
    };
  };

  public getPullRequests = async (): Promise<{
    detail: PullsListResponseData,
    commitDetails: PullsListCommitsResponseData
  }[]> => {
    const { data } = await this.octokit.rest.pulls.list({
      owner: this.owner,
      repo: this.repo,
      state: "all",
      per_page: 100,
    });

    const pullNumbers = data.map((item) => item.number);
    const pullRequests = await Promise.all(pullNumbers.map((pullNumber) => this._getPullRequest(pullNumber)));

    return pullRequests;
  };
}

export default PluginOctokit;