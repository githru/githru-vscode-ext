import classNames from "classnames/bind";

import type { AuthorInfo } from "types";

import styles from "./Author.module.scss";

const Author = ({ name, src }: AuthorInfo) => {
  const cx = classNames.bind(styles);
  return (
    <div
      className={cx("author")}
      data-tooltip-text={name}
    >
      <img
        src={src}
        alt=""
      />
    </div>
  );
};

export default Author;
