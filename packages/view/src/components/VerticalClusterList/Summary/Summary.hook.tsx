import { useEffect, useState } from "react";

import { useGlobalData } from "hooks";

import { getAuthSrcMap } from "./Summary.util";

export const usePreLoadAuthorImg = () => {
  const { data } = useGlobalData();
  const [authSrcMap, setAuthSrcMap] = useState({});

  useEffect(() => {
    getAuthSrcMap(data)
      .then(setAuthSrcMap)
      .catch(() => setAuthSrcMap({}));
  }, [data]);

  return authSrcMap;
};
