import classNames from "classnames/bind";

import styles from "./VerticalClusterList.module.scss";
import { ClusterGraph } from "./ClusterGraph";
import { Summary } from "./Summary";

const VerticalClusterList = () => {
  const cx = classNames.bind(styles);
  return (
    <div className={cx("vertical-cluster-list")}>
      <ClusterGraph />
      <Summary />
    </div>
  );
};

export default VerticalClusterList;
