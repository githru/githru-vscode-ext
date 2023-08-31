import { fakePrev } from "../fakeAsset";

import { getClusterSizes, getGraphHeight } from "./ClusterGraph.util";

test("getClusterSizes test", () => {
  const result = getClusterSizes(fakePrev);
  for (let i = 0; i < result.length; i += 1) {
    expect(result[i]).toBe(1);
  }
});

test("getGraphHeight test", () => {
  const result1 = getGraphHeight([1]);
  const result2 = getGraphHeight([1, 1]);
  const result3 = getGraphHeight([1, 1, 1]);
  const result4 = getGraphHeight([1, 1, 1, 1]);
  const result5 = getGraphHeight([1, 1, 1, 1, 1]);
  expect(result1).toBe(60);
  expect(result2).toBe(110);
  expect(result3).toBe(160);
  expect(result4).toBe(210);
  expect(result5).toBe(260);
});

test("getClusterPosition test", () => {
  const result = getClusterSizes(fakePrev);
  for (let i = 0; i < result.length; i += 1) {
    expect(result[i]).toBe(1);
  }
});
