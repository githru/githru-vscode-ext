import { injectable } from "inversify";

import type { FetchDataRequestPayload, IDEMessage, IDEMessageEvent, RefreshDataRequestPayload } from "types";
import type { IDESentEvents } from "types/IDESentEvents";

import fakeData from "../fake-assets/cluster-nodes.json";
import fakeBranchList from "../fake-assets/branch-list.json";

import type IDEPort from "./IDEPort";

@injectable()
export default class FakeIDEAdapter implements IDEPort {
  private currentPage = 0;

  private readonly PAGE_SIZE = 20;

  private readonly TOTAL_PAGES = 5;

  private lastProcessedCommitId: string | undefined = undefined;

  public addIDESentEventListener(events: IDESentEvents) {
    const onReceiveMessage = (e: IDEMessageEvent): void => {
      const responseMessage = e.data;
      const { command, payload } = responseMessage;

      switch (command) {
        case "fetchAnalyzedData":
        case "refresh":
          return events.handleChangeAnalyzedData(payload ? JSON.parse(payload) : undefined);
        case "fetchBranchList":
          return events.handleChangeBranchList(payload ? JSON.parse(payload) : undefined);
        case "fetchGithubInfo":
          return events.handleGithubInfo(payload ? JSON.parse(payload) : undefined);
        default:
          console.log("Unknown Message");
      }
    };

    window.addEventListener("message", onReceiveMessage);
  }

  public sendRefreshDataMessage(requestParams?: RefreshDataRequestPayload) {
    const payload = requestParams ? JSON.stringify(requestParams) : undefined;
    const message: IDEMessage = {
      command: "refresh",
      payload,
    };
    this.sendMessageToMe(message);
  }

  public sendFetchAnalyzedDataMessage(requestParams?: FetchDataRequestPayload) {
    const payload = requestParams ? JSON.stringify(requestParams) : undefined;
    const message: IDEMessage = {
      command: "fetchAnalyzedData",
      payload,
    };
    setTimeout(() => {
      // loading time을 시뮬레이션 하기 위함
      this.sendMessageToMe(message);
    }, 1500);
  }

  public sendFetchBranchListMessage() {
    const message: IDEMessage = {
      command: "fetchBranchList",
    };
    this.sendMessageToMe(message);
  }

  public sendFetchGithubInfo() {
    const message: IDEMessage = {
      command: "fetchGithubInfo",
    };
    this.sendMessageToMe(message);
  }

  public sendUpdateThemeMessage(theme: string) {
    const message: IDEMessage = {
      command: "updateTheme",
      payload: JSON.stringify({ theme }),
    };
    this.sendMessageToMe(message);
  }

  private sendMessageToMe(message: IDEMessage) {
    const convertedMessage = this.convertMessage(message);
    window.postMessage(convertedMessage, "*");
  }

  private convertMessage(message: IDEMessage) {
    const { command, payload } = message;

    switch (command) {
      case "fetchAnalyzedData":
      case "refresh": {
        // Parse request params to check if this is a load more request
        const requestParams = payload ? JSON.parse(payload) : undefined;
        const currentCommitId = requestParams?.lastCommitId;

        // Reset page on refresh command
        if (command === "refresh") {
          this.currentPage = 0;
          this.lastProcessedCommitId = undefined;
        }
        // Reset page on first load (no lastCommitId)
        else if (!currentCommitId) {
          this.currentPage = 0;
          this.lastProcessedCommitId = undefined;
        }
        // Increment page only when we get a NEW lastCommitId (load more)
        else if (currentCommitId !== this.lastProcessedCommitId) {
          this.currentPage += 1;
          this.lastProcessedCommitId = currentCommitId;
        }

        // Calculate pagination
        const startIdx = this.currentPage * this.PAGE_SIZE;
        const endIdx = Math.min(startIdx + this.PAGE_SIZE, fakeData.length);
        const pageData = fakeData.slice(startIdx, endIdx);
        const isLastPage = this.currentPage >= this.TOTAL_PAGES - 1;

        // Get the last commit ID from the current page for nextCommitId
        const lastCommitInPage =
          pageData.length > 0 ? pageData[pageData.length - 1].commitNodeList[0]?.commit : undefined;
        const nextCommitId = !isLastPage && lastCommitInPage ? lastCommitInPage.id : undefined;

        const isLoadMore = currentCommitId !== undefined;

        return {
          command,
          payload: JSON.stringify({
            clusterNodes: pageData,
            isLastPage,
            nextCommitId,
            isLoadMore,
            isPRSuccess: true,
          }),
        };
      }
      case "fetchBranchList":
        return {
          command,
          payload: JSON.stringify(fakeBranchList),
        };
      case "updateTheme":
        return {
          command,
          payload: sessionStorage.getItem("CUSTOM_THEME") as string,
        };
      default:
        return {
          command,
        };
    }
  }
}
