import { useEffect, useState } from "react";

import { useGlobalData } from "hooks";

import { getAuthSrcMap } from "./Summary.util";
import type { AuthSrcMap } from "./Summary.type";

export const usePreLoadAuthorImg = () => {
  const { data } = useGlobalData();
  const [authSrcMap, setAuthSrcMap] = useState<AuthSrcMap | null>(null);

  useEffect(() => {
    getAuthSrcMap(data)
      .then(setAuthSrcMap)
      .catch(() => setAuthSrcMap(null));
  }, [data]);

  return authSrcMap;
};
