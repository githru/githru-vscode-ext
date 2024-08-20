import { injectable } from "tsyringe";

import type { IDEMessage, IDEMessageEvent } from "types";
import type { IDESentEvents } from "types/IDESentEvents";

import fakeData from "../fake-assets/cluster-nodes.json";
import fakeBranchList from "../fake-assets/branch-list.json";

import type IDEPort from "./IDEPort";

@injectable()
export default class FakeIDEAdapter implements IDEPort {
  public addIDESentEventListener(events: IDESentEvents) {
    const onReceiveMessage = (e: IDEMessageEvent): void => {
      const responseMessage = e.data;
      const { command, payload } = responseMessage;

      switch (command) {
        case "fetchAnalyzedData":
          return events.handleChangeAnalyzedData(payload ? JSON.parse(payload) : undefined);
        case "fetchBranchList":
          return events.handleChangeBranchList(payload ? JSON.parse(payload) : undefined);
        case "fetchMoreGitLog": {
          const gitLogOffset = JSON.parse(payload || "")?.offset;

          if (gitLogOffset) {
            events.handleChangeGitLogSkipCount(+gitLogOffset);
          } else {
            console.log("Invalid Offset", gitLogOffset);
          }
          break;
        }
        default:
          console.log("Unknown Message");
      }
    };

    window.addEventListener("message", onReceiveMessage);
  }

  public sendFetchMoreGitLogMessage(offset = 0, limit = 100) {
    const message: IDEMessage = {
      command: "fetchMoreGitLog",
      payload: JSON.stringify({ offset, limit }),
    };
    this.sendMessageToMe(message);
  }

  public sendRefreshDataMessage(payload?: string) {
    const message: IDEMessage = {
      command: "refresh",
      payload,
    };
    this.sendMessageToMe(message);
  }

  public sendFetchAnalyzedDataMessage(payload?: string) {
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

  public setPrimaryColor(color: string) {
    sessionStorage.setItem("PRIMARY_COLOR", color);
    const message: IDEMessage = {
      command: "updatePrimaryColor",
    };
    this.sendMessageToMe(message);
  }

  private convertMessage(message: IDEMessage) {
    const { command } = message;

    switch (command) {
      case "fetchMoreGitLog":
        return {
          command,
          payload: { offset: 100, limit: 100 },
        };
      case "fetchAnalyzedData":
        return {
          command,
          payload: JSON.stringify(fakeData),
        };
      case "fetchBranchList":
        return {
          command,
          payload: JSON.stringify(fakeBranchList),
        };
      case "updatePrimaryColor":
        return {
          command,
          payload: sessionStorage.getItem("PRIMARY_COLOR") as string,
        };
      default:
        return {
          command,
        };
    }
  }

  private sendMessageToMe(message: IDEMessage) {
    window.postMessage(this.convertMessage(message));
  }
}
