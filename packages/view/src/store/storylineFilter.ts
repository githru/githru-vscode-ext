import { create } from "zustand";

/**
 * 릴리즈 범위 필터 타입
 */
export interface ReleaseRangeFilter {
  startReleaseIndex: number;
  endReleaseIndex: number;
}

/**
 * StorylineChart 필터 상태
 */
interface StorylineFilterState {
  /** 선택된 릴리즈 범위 (null이면 전체 범위) */
  releaseRange: ReleaseRangeFilter | null;
  /** 선택된 기여자 목록 (빈 배열이면 전체 기여자) */
  selectedContributors: string[];
  /** 최대 선택 가능 기여자 수 */
  maxContributors: number;
  /** 릴리즈 범위 설정 */
  setReleaseRange: (range: ReleaseRangeFilter | null) => void;
  /** 기여자 추가/제거 토글 */
  toggleContributor: (contributorName: string) => void;
  /** 기여자 목록 초기화 */
  clearContributors: () => void;
  /** 모든 필터 초기화 */
  resetFilters: () => void;
}

/**
 * StorylineChart 필터 store
 */
export const useStorylineFilterStore = create<StorylineFilterState>((set) => ({
  releaseRange: null,
  selectedContributors: [],
  maxContributors: 8,
  setReleaseRange: (range) => set({ releaseRange: range }),
  toggleContributor: (contributorName) =>
    set((state) => {
      const isSelected = state.selectedContributors.includes(contributorName);
      if (isSelected) {
        // 이미 선택된 경우 제거
        return {
          selectedContributors: state.selectedContributors.filter((name) => name !== contributorName),
        };
      }
      // 선택되지 않은 경우 추가 (최대 개수 체크)
      if (state.selectedContributors.length >= state.maxContributors) {
        return state; // 최대 개수 초과 시 변경 없음
      }
      return {
        selectedContributors: [...state.selectedContributors, contributorName],
      };
    }),
  clearContributors: () => set({ selectedContributors: [] }),
  resetFilters: () => set({ releaseRange: null, selectedContributors: [] }),
}));
