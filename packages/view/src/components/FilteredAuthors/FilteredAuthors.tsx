import { Author } from "components/VerticalClusterList/Summary/Author";
import { usePreLoadAuthorImg } from "components/VerticalClusterList/Summary/Summary.hook";
import { getInitData } from "components/VerticalClusterList/Summary/Summary.util";
import { useGlobalData } from "hooks";

import "./FilteredAuthors.scss";

const FilteredAuthors = () => {
  const { selectedData } = useGlobalData();
  const authSrcMap = usePreLoadAuthorImg();
  const selectedClusters = getInitData(selectedData);

  return (
    <div className="selected-container">
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
