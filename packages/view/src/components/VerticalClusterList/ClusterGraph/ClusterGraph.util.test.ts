import { fakePrev, fakePrev2, fakePrev3, fakePrev4 } from "../../../../tests/fakeAsset";

import { getClusterSizes, getGraphHeight, getSelectedIndex } from "./ClusterGraph.util";

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

/*
export function getSelectedIndex(data: ClusterNode[], selectedData: SelectedDataProps) {
  return selectedData
    .map((selected) => selected.commitNodeList[0].clusterId)
    .map((clusterId) => data.findIndex((item) => item.commitNodeList[0].clusterId === clusterId))
    .filter((idx) => idx !== -1);
}
data에서 ClusterId가 같을경우 return 즉, 같은 array길이 return 

export function getClusterPosition(d: ClusterGraphElement, i: number, detailElementHeight: number, isPrev = false) {
  const selected = isPrev ? d.selected.prev : d.selected.current;
  const selectedLength = selected.filter((selectedIdx) => selectedIdx < i).length;
  const margin = selectedLength * detailElementHeight;
  const x = SVG_MARGIN.left;
  const y = SVG_MARGIN.top + i * (CLUSTER_HEIGHT + NODE_GAP) + margin;
  return `translate(${x}, ${y})`;
}
*/
