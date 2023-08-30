import { selectedDataUpdater } from "./VerticalClusterList.util";
import { fakeFirstClusterNode, fakeSecondClusterNode, fakePrev } from "./fakeTask";

test("FirstSelectedDataUpdater test", () => {
  const fakeDataUpdater = selectedDataUpdater(fakeFirstClusterNode, 0);
  const result = fakeDataUpdater([]);

  expect(fakeDataUpdater).not.toBeUndefined();
  expect(typeof fakeDataUpdater).toBe("function");
  expect(result.length).toBe(1);
  for (let i = 0; i < result.length; i += 1) {
    expect(result[i]).not.toBeUndefined();
  }
});

test("SecondSelectedDataUpdater test", () => {
  const fakeDataUpdater = selectedDataUpdater(fakeFirstClusterNode, 5);
  const result = fakeDataUpdater(fakePrev);

  expect(fakeDataUpdater).not.toBeUndefined();
  expect(typeof fakeDataUpdater).toBe("function");
  expect(result).not.toBeUndefined();
  expect(result).not.toBeUndefined();
  expect(result.length).toBe(3);
  for (let i = 0; i < result.length; i += 1) {
    expect(result[i]).not.toBeUndefined();
  }
});

test("ThirdSelectedDataUpdater test", () => {
  const fakeDataUpdater = selectedDataUpdater(fakeSecondClusterNode, 1);
  const result = fakeDataUpdater(fakePrev);

  expect(fakeDataUpdater).not.toBeUndefined();
  expect(typeof fakeDataUpdater).toBe("function");
  expect(result).not.toBeUndefined();
  expect(result.length).toBe(1);
  for (let i = 0; i < result.length; i += 1) {
    expect(result[i]).not.toBeUndefined();
  }
});
