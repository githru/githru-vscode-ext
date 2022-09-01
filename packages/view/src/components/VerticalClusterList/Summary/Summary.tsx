import type { GlobalProps } from "types/global";

import "./Summary.scss";
import { Content } from "./Content";

import {
  information,
  getCommitAuthorNames,
  getCommitIds,
  getCommitMessages,
} from ".";

const Summary = ({ data }: GlobalProps) => {
  information.ids = getCommitIds({ data });
  information.names = getCommitAuthorNames({ data });
  information.messages = getCommitMessages({ data });

  return <Content info={information} />;
};

export default Summary;
