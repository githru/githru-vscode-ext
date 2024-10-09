import { useEffect, useState } from "react";

import { useDataStore } from "store";

import { getAuthSrcMap } from "./Summary.util";
import type { AuthSrcMap } from "./Summary.type";

export const usePreLoadAuthorImg = () => {
  const data = useDataStore((state) => state.data);
  const [authSrcMap, setAuthSrcMap] = useState<AuthSrcMap | null>(null);

  useEffect(() => {
    getAuthSrcMap(data)
      .then(setAuthSrcMap)
      .catch(() => setAuthSrcMap(null));
  }, [data]);

  return authSrcMap;
};
