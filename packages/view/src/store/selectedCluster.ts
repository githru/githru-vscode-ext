import { create } from "zustand";

import {
  CLUSTER_HEIGHT,
  DETAIL_HEIGHT,
  NODE_GAP,
} from "components/VerticalClusterList/ClusterGraph/ClusterGraph.const";

const COLLAPSED_ROW_HEIGHT = CLUSTER_HEIGHT + NODE_GAP * 2;
const EXPANDED_ROW_HEIGHT = DETAIL_HEIGHT + COLLAPSED_ROW_HEIGHT;

type SelectedClusterState = {
  expandedClusterIds: Set<number>;
  detailRef: HTMLDivElement | null;
  toggleCluster: (clusterId: number) => void;
  isExpanded: (clusterId: number) => boolean;
  getRowHeight: (clusterId: number) => number;
  setDetailRef: (ref: HTMLDivElement | null) => void;
  scrollToDetail: () => void;
};

export const useSelectedClusterStore = create<SelectedClusterState>((set, get) => ({
  expandedClusterIds: new Set<number>(),
  detailRef: null,

  toggleCluster: (clusterId: number) => {
    set((state) => {
      const newSet = new Set(state.expandedClusterIds);
      if (newSet.has(clusterId)) {
        newSet.delete(clusterId);
      } else {
        newSet.add(clusterId);
      }
      return { expandedClusterIds: newSet };
    });

    // 스크롤 로직 실행
    setTimeout(() => {
      get().scrollToDetail();
    }, 0);
  },

  isExpanded: (clusterId: number) => {
    return get().expandedClusterIds.has(clusterId);
  },

  getRowHeight: (clusterId: number) => {
    return get().expandedClusterIds.has(clusterId) ? EXPANDED_ROW_HEIGHT : COLLAPSED_ROW_HEIGHT;
  },

  setDetailRef: (ref: HTMLDivElement | null) => {
    set({ detailRef: ref });
  },

  scrollToDetail: () => {
    const { detailRef } = get();
    if (detailRef) {
      detailRef.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    }
  },
}));
