import { singleton, inject } from "tsyringe";
import { OctokitOptions } from "@octokit/core/dist-types/types";
import { Octokit } from "@octokit/rest";
import { throttling } from "@octokit/plugin-throttling";
import { ThrottlingOptions } from "@octokit/plugin-throttling/dist-types/types";

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
          console.log(
            `[L] - request quota exhausted for request ${method} ${url}`
          );

          if (retryCount <= 1) {
            console.log(`[L] - retrying after ${retryAfter} seconds!`);
            return true;
          }
          return false;
        },
        onAbuseLimit: (retryAfter, options) => {
          const { method, url } = options as { method: string; url: string };
          throw new Error(
            `[E] - abuse detected for request ${method} ${url} ${retryAfter}`
          );
        },
      },
    });
    this.owner = props.owner;
    this.repo = props.repo;
  }

  private _getPullRequest = async (pullNumber: number) => {
    const { owner, repo } = this;

    const pullRequestDetail = await this.rest.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
    });

    const pullRequestCommits = await this.rest.pulls.listCommits({
      owner,
      repo,
      pull_number: pullNumber,
    });

    return {
      detail: pullRequestDetail,
      commitDetails: pullRequestCommits,
    };
  };

  public getPullRequests = async () => {
    const { owner, repo } = this;

    const { data } = await this.rest.pulls.list({
      owner,
      repo,
      state: "all",
      per_page: 100,
    });

    const pullNumbers = data.map((item) => item.number);

    const pullRequests = await Promise.all(
      pullNumbers.map((pullNumber) => this._getPullRequest(pullNumber))
    );

    return pullRequests;
  };
}

export default PluginOctokit;
