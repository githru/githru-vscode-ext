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
      let payloadData;

      // payload에서 string으로 올때 있고 object로 올때 있음 이건 잡아줘야하는 버그인데 당분간 못 잡지 않을까 ...
      if (typeof payload === "string") {
        try {
          payloadData = JSON.parse(payload);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          payloadData = payload; // JSON 파싱 실패시 원래 문자열 사용
        }
      } else if (typeof payload === "object") {
        payloadData = payload; // 이미 객체인 경우 그대로 사용
      } else {
        payloadData = undefined; // 그 외의 경우, undefined로 설정
      }

      switch (command) {
        case "fetchAnalyzedData":
          return events.handleChangeAnalyzedData(payloadData);
        case "fetchBranchList":
          return events.handleChangeBranchList(payloadData);
        default:
          console.log("Unknown Message");
      }
    };

    window.addEventListener("message", onReceiveMessage);
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
      this.sendMessageToMe(message);
    }, 3000);
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
