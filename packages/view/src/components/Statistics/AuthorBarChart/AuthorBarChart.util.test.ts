import type { ClusterNode } from "types";

import { getDataByAuthor } from "./AuthorBarChart.util";

describe("getDataByAuthor", () => {
  it("should return empty array if no data is provided", () => {
    const fakeData: ClusterNode[] = [];
    const result = getDataByAuthor(fakeData);
    expect(result).toEqual([]);
  });
});
