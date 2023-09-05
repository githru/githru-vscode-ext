import { fakeFirstClusterNode, fakePrev, fakePrev2, fakePrev3, fakePrev4 } from "../../../../tests/fakeAsset";

import { getClusterSizes, getGraphHeight, getClusterPosition, getSelectedIndex } from "./ClusterGraph.util";
import type { ClusterGraphElement } from "./ClusterGraph.type";

test("getClusterSizes", () => {
  const result = getClusterSizes(fakePrev);
  for (let i = 0; i < result.length; i += 1) {
    expect(result[i]).toBe(1);
  }
});

test("getGraphHeight", () => {
  const resultLength1 = getGraphHeight([1]);
  const resultLength2 = getGraphHeight([1, 1]);
  const resultLength3 = getGraphHeight([1, 1, 1]);
  const resultLength4 = getGraphHeight([1, 1, 1, 1]);
  const resultLength5 = getGraphHeight([1, 1, 1, 1, 1]);
  expect(resultLength1).toBe(60);
  expect(resultLength2).toBe(110);
  expect(resultLength3).toBe(160);
  expect(resultLength4).toBe(210);
  expect(resultLength5).toBe(260);
});

test("getSelectedIndex", () => {
  const resultSameEle = getSelectedIndex(fakePrev, fakePrev2);
  const resultEmptyArray = getSelectedIndex(fakePrev2, fakePrev3);
  const resultDiffEle = getSelectedIndex(fakePrev, fakePrev4);
  expect(resultSameEle.length).toBe(1);
  expect(resultEmptyArray.length).toBe(0);
  expect(resultDiffEle.length).toBe(0);
});

const fakeClusterGraphElement: ClusterGraphElement = {
  cluster: fakeFirstClusterNode,
  clusterSize: 1,
  selected: {
    prev: [0, 1, 2, 3],
    current: [5, 6, 7, 8],
  },
};

test("getClusterPosition", () => {
  const result1 = getClusterPosition(fakeClusterGraphElement, 1, 1, true);
  const result2 = getClusterPosition(fakeClusterGraphElement, 1, 6, false);
  const result3 = getClusterPosition(fakeClusterGraphElement, 2, 3, true);
  expect(result1).toBe("translate(2, 61)");
  expect(result2).toBe("translate(2, 60)");
  expect(result3).toBe("translate(2, 116)");
});
