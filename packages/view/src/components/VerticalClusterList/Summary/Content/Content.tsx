import { nanoid } from "nanoid";

import type { IInfo } from "../Summary.type";
import "./Content.scss";

export const Content = ({ info }: IInfo) => {
  return (
    <div className="box">
      {info.names.map((v, i) => {
        return (
          <p className="summary" key={`${nanoid()}`}>
            <span className="nameBox" key={`${nanoid()}`}>
              {v.map((a) => (
                <span
                  className="name"
                  key={`${nanoid()}`}
                  data-tooltip-text={a}
                >
                  {a.slice(0, 1)}
                </span>
              ))}
            </span>
            <span className="message" key={`${nanoid()}`}>
              {info.messages[i]}
            </span>
          </p>
        );
      })}
    </div>
  );
};
