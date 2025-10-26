import { Author } from "components/@common/Author";
import { usePreLoadAuthorImg } from "components/VerticalClusterList/Summary/Summary.hook";
import { getInitData } from "components/VerticalClusterList/Summary/Summary.util";
import { useDataStore } from "store";

import "./FilteredAuthors.scss";

const FilteredAuthors = () => {
  const selectedData = useDataStore((state) => state.selectedData);
  const authSrcMap = usePreLoadAuthorImg();
  const selectedClusters = getInitData(selectedData);

  // 2차원 authorNames를 평탄화하고 중복 제거
  const uniqueAuthorNames = Array.from(
    new Set(selectedClusters.flatMap((cluster) => cluster.summary.authorNames.flat()))
  );

  return (
    <div className="filtered-authors">
      <p className="filtered-authors__label">Authors:</p>
      <div className="filtered-authors__author">
        {authSrcMap &&
          uniqueAuthorNames.map((authorName) => (
            <Author
              key={authorName}
              name={authorName}
              src={authSrcMap[authorName]}
            />
          ))}
      </div>
    </div>
  );
};

export default FilteredAuthors;
