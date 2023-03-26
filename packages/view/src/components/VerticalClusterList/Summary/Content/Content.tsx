import {
  IoIosArrowDropdownCircle,
  IoIosArrowDropupCircle,
} from "react-icons/io";

import type { ContentProps } from "../Summary.type";

const Content = ({ content, clusterId, selectedClusterId }: ContentProps) => {
  return (
    <>
      <div className="cluster-summary__contents">
        <div className="commit-message__wrapper">
          <div className="commit-message">{content.message}</div>
        </div>
        {content.count > 0 && (
          <span className="more-commit-count">+ {content.count} more</span>
        )}
      </div>
      <div className="collapsible-icon">
        {selectedClusterId.includes(clusterId) ? (
          <IoIosArrowDropupCircle className="show" />
        ) : (
          <IoIosArrowDropdownCircle />
        )}
      </div>
    </>
  );
};

export default Content;
