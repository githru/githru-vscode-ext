import { useDataStore } from "store";

export const useGetSelectedData = () => {
  const { filteredData, selectedData } = useDataStore();
  return selectedData.length ? selectedData : filteredData;
};
