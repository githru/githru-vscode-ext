import { useGlobalData } from "../../hooks/useGlobalData";

export const useGetSelectedData = () => {
  const { filteredData, selectedData } = useGlobalData();
  return (selectedData ? [selectedData] : filteredData) ?? [];
};
