import type { OctokitOptions } from "@octokit/core/dist-types/types";
import { throttling } from "@octokit/plugin-throttling";
import type { ThrottlingOptions } from "@octokit/plugin-throttling/dist-types/types";
import { Octokit, type RestEndpointMethodTypes } from "@octokit/rest";
import { inject, singleton } from "tsyringe";

type PullsListResponseData = RestEndpointMethodTypes["pulls"]["get"]["response"];
type PullsListCommitsResponseData = RestEndpointMethodTypes["pulls"]["listCommits"]["response"];

@singleton()
export class PluginOctokit extends Octokit.plugin(throttling) {
  private owner: string;

  private repo: string;

  constructor(
    @inject("OctokitOptions")
    props: {
      owner: string;
      repo: string;
      options: Partial<OctokitOptions & ThrottlingOptions>;
    }
  ) {
    super({
      ...props.options,
      throttle: {
        onRateLimit: (retryAfter, options) => {
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
        onAbuseLimit: (retryAfter, options) => {
          const { method, url } = options as { method: string; url: string };
          throw new Error(`[E] - abuse detected for request ${method} ${url} ${retryAfter}`);
        },
      },
    });
    this.owner = props.owner;
    this.repo = props.repo;
  }

  private _getPullRequest = async (pullNumber: number) => {
    const { owner, repo } = this;

    const pullRequestDetail:PullsListResponseData = await this.rest.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
    });

    const pullRequestCommits:PullsListCommitsResponseData = await this.rest.pulls.listCommits({
      owner,
      repo,
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
    const { owner, repo } = this;

    const { data } = await this.rest.pulls.list({
      owner,
      repo,
      state: "all",
      per_page: 100,
    });

    const pullNumbers = data.map((item) => item.number);

    const pullRequests = await Promise.all(pullNumbers.map((pullNumber) => this._getPullRequest(pullNumber)));

    return pullRequests;
  };
}

export default PluginOctokit;
