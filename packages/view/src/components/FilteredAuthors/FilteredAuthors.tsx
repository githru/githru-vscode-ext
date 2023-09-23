import classNames from "classnames/bind";

import { Author } from "components/@common/Author";
import { usePreLoadAuthorImg } from "components/VerticalClusterList/Summary/Summary.hook";
import { getInitData } from "components/VerticalClusterList/Summary/Summary.util";
import { useGlobalData } from "hooks";

import styles from "./FilteredAuthors.module.scss";

const FilteredAuthors = () => {
  const cx = classNames.bind(styles);
  const { selectedData } = useGlobalData();
  const authSrcMap = usePreLoadAuthorImg();
  const selectedClusters = getInitData(selectedData);

  return (
    <div className={cx("selected-container")}>
      {authSrcMap &&
        selectedClusters.map((selectedCluster) => {
          return selectedCluster.summary.authorNames.map((authorArray: string[]) => {
            return authorArray.map((authorName: string) => (
              <Author
                key={authorName}
                name={authorName}
                src={authSrcMap[authorName]}
              />
            ));
          });
        })}
    </div>
  );
};

export default FilteredAuthors;
