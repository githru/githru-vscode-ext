import { fakeFirstClusterNode, fakeSecondClusterNode } from "../../tests/fakeAsset";

import { useDataStore } from "./data";

const firstClusterId = fakeFirstClusterNode.commitNodeList[0].clusterId;
const secondClusterId = fakeSecondClusterNode.commitNodeList[0].clusterId;

const toggleFirstCluster = () => useDataStore.getState().toggleSelectedData(fakeFirstClusterNode, firstClusterId);
const toggleSecondCluster = () => useDataStore.getState().toggleSelectedData(fakeSecondClusterNode, secondClusterId);
const getSelectedData = () => useDataStore.getState().selectedData;

describe("useDataStore - toggleSelectedData", () => {
  beforeEach(() => {
    useDataStore.getState().setSelectedData([]);
  });

  it("adds a cluster when selected data is empty", () => {
    toggleFirstCluster();

    expect(getSelectedData()).toHaveLength(1);
    expect(getSelectedData()[0]).toEqual(fakeFirstClusterNode);
    expect(getSelectedData()[0].nodeTypeName).toBe("CLUSTER");
  });

  it("appends a new cluster when it has a different clusterId", () => {
    toggleFirstCluster();
    expect(getSelectedData()).toHaveLength(1);

    toggleSecondCluster();

    expect(getSelectedData()).toHaveLength(2);
    expect(getSelectedData()[0].commitNodeList[0].clusterId).toBe(firstClusterId);
    expect(getSelectedData()[1].commitNodeList[0].clusterId).toBe(secondClusterId);
  });

  it("removes an already selected cluster when toggled again", () => {
    toggleFirstCluster();
    toggleSecondCluster();

    expect(getSelectedData()).toHaveLength(2);
    expect(getSelectedData()).toEqual([fakeFirstClusterNode, fakeSecondClusterNode]);

    toggleFirstCluster();

    expect(getSelectedData()).toHaveLength(1);
    expect(getSelectedData()).toEqual([fakeSecondClusterNode]);
    expect(getSelectedData()[0].commitNodeList[0].clusterId).toBe(secondClusterId);
  });

  it("keeps nodeTypeName as CLUSTER for all selected clusters", () => {
    toggleFirstCluster();
    toggleSecondCluster();

    getSelectedData().forEach((cluster) => {
      expect(cluster.nodeTypeName).toBe("CLUSTER");
    });
  });

  it("toggling the same cluster twice returns to original state", () => {
    toggleFirstCluster();
    expect(getSelectedData()).toHaveLength(1);

    toggleFirstCluster();
    expect(getSelectedData()).toHaveLength(0);
  });
});
