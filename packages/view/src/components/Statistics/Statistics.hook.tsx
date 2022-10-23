import { useGlobalData } from "hooks";

export const useGetSelectedData = () => {
  const { filteredData, selectedData } = useGlobalData();
  return selectedData.length ? selectedData : filteredData;
};
