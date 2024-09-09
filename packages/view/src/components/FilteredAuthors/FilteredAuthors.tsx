import { Author } from "components/@common/Author";
import { usePreLoadAuthorImg } from "components/VerticalClusterList/Summary/Summary.hook";
import { getInitData } from "components/VerticalClusterList/Summary/Summary.util";
import { useGlobalData } from "hooks";

import "./FilteredAuthors.scss";

const FilteredAuthors = () => {
  const { selectedData } = useGlobalData();
  const authSrcMap = usePreLoadAuthorImg();
  const selectedClusters = getInitData(selectedData);

  // 이미 선택된 사용자를 관리
  const addedAuthors = new Set();

  return (
    <div className="filtered-authors">
      <p className="filtered-authors__label">Authors:</p>
      <div className="filtered-authors__author">
        {authSrcMap &&
          selectedClusters.map((selectedCluster) => {
            return selectedCluster.summary.authorNames.map((authorArray: string[]) => {
              return authorArray.map((authorName: string) => {
                // 이미 추가된 사용자인지 확인 후 추가되지 않은 경우에만 추가하고 Set에 이름을 저장
                if (!addedAuthors.has(authorName)) {
                  addedAuthors.add(authorName);
                  return (
                    <Author
                      key={authorName}
                      name={authorName}
                      src={authSrcMap[authorName]}
                    />
                  );
                }
                // 이미 추가된 사용자인 경우 null 반환
                return null;
              });
            });
          })}
      </div>
    </div>
  );
};

export default FilteredAuthors;
