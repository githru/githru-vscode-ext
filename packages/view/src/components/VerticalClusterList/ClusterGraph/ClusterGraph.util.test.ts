import { fakeFirstClusterNode, fakePrev, fakePrev2, fakePrev3, fakePrev4 } from "../../../../tests/fakeAsset";

import { getClusterSizes, getGraphHeight, getTranslateAfterSelect, getSelectedIndex } from "./ClusterGraph.util";
import type { ClusterGraphElement } from "./ClusterGraph.type";

const getClusterSizesResult = getClusterSizes(fakePrev);

test.each(getClusterSizesResult)("getClusterSizes", (Cluster) => {
  expect(Cluster).toBe(1);
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
  const resultPrev = getTranslateAfterSelect(fakeClusterGraphElement, 1, 1, true);
  const resultCurrent = getTranslateAfterSelect(fakeClusterGraphElement, 1, 6, false);
  const resultDiffI = getTranslateAfterSelect(fakeClusterGraphElement, 2, 3, true);
  expect(resultPrev).toBe("translate(2, 61)");
  expect(resultCurrent).toBe("translate(2, 60)");
  expect(resultDiffI).toBe("translate(2, 116)");
});
