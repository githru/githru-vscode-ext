import {
  fakeFirstClusterNode,
  fakeSecondClusterNode,
  fakePrev,
} from "../../../tests/fakeAsset";

import { selectedDataUpdater } from "./VerticalClusterList.util";

const EmptyArrayAddSelectedDataUpdater = selectedDataUpdater(
  fakeFirstClusterNode,
  0,
);
const PrevAddSelectedDataUpdater = selectedDataUpdater(fakeFirstClusterNode, 5);
const RemoveSelectedDataUpdater = selectedDataUpdater(fakeSecondClusterNode, 1);

const EmptyArrayAddSelectedresult = EmptyArrayAddSelectedDataUpdater([]);
const PrevAddSelectedresult = PrevAddSelectedDataUpdater(fakePrev);
const RemoveSelectedresult = RemoveSelectedDataUpdater(fakePrev);

test("EmptyArrayAddSelectedDataUpdater", () => {
  expect(EmptyArrayAddSelectedDataUpdater).not.toBeUndefined();
  expect(typeof EmptyArrayAddSelectedDataUpdater).toBe("function");
  expect(EmptyArrayAddSelectedresult).not.toBeUndefined();
  expect(EmptyArrayAddSelectedresult.length).toBe(1);
});

test("PrevAddSelectedDataUpdater", () => {
  expect(PrevAddSelectedDataUpdater).not.toBeUndefined();
  expect(typeof PrevAddSelectedDataUpdater).toBe("function");
  expect(PrevAddSelectedresult).not.toBeUndefined();
  expect(PrevAddSelectedresult.length).toBe(3);
});

test("RemoveSelectedDataUpdater", () => {
  expect(RemoveSelectedDataUpdater).not.toBeUndefined();
  expect(typeof RemoveSelectedDataUpdater).toBe("function");
  expect(RemoveSelectedresult).not.toBeUndefined();
  expect(RemoveSelectedresult.length).toBe(1);
});

test.each(EmptyArrayAddSelectedresult)("EmptyArrayAddSelected", (Cluster) => {
  expect(Cluster).not.toBeUndefined();
  expect(Cluster.nodeTypeName).toBe("CLUSTER");
});

test.each(PrevAddSelectedresult)("prevAddSelected", (Cluster) => {
  expect(Cluster).not.toBeUndefined();
  expect(Cluster.nodeTypeName).toBe("CLUSTER");
});

test.each(RemoveSelectedresult)("RemoveSelectedSelected", (Cluster) => {
  expect(Cluster).not.toBeUndefined();
  expect(Cluster.nodeTypeName).toBe("CLUSTER");
});
