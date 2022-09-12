import { useEffect, useState } from "react";
import type { RefObject } from "react";
import type { SelectedDataProps } from "types";

export const useResizeObserver = (
  ref: RefObject<HTMLDivElement>,
  selectedData: SelectedDataProps
) => {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    let RO: ResizeObserver | null = new ResizeObserver((entries) => {
      if (!Array.isArray(entries)) {
        return;
      }
      const { contentRect } = entries[0];
      setHeight(contentRect.height);
    });

    if (ref.current) {
      RO.observe(ref.current);
    }

    return () => {
      if (RO) {
        RO.disconnect();
        RO = null;
      }
    };
  }, [ref.current, selectedData]);

  return [height];
};
