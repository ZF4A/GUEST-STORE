import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SectionTitle {
  caption: string;
  headline: string;
}

const SECTION_IDS = ['trending', 'bestsellers', 'newarrivals', 'sold', 'premium'] as const;
export type SectionId = typeof SECTION_IDS[number];

interface SectionState {
  overrides: Partial<Record<SectionId, SectionTitle>>;
  setTitle: (id: SectionId, title: SectionTitle) => void;
  resetTitle: (id: SectionId) => void;
  resetAll: () => void;
}

export const useSectionStore = create<SectionState>()(
  persist(
    (set) => ({
      overrides: {},
      setTitle: (id, title) =>
        set((s) => ({ overrides: { ...s.overrides, [id]: title } })),
      resetTitle: (id) =>
        set((s) => {
          const next = { ...s.overrides };
          delete next[id];
          return { overrides: next };
        }),
      resetAll: () => set({ overrides: {} }),
    }),
    { name: 'quest-section-titles' }
  )
);

export { SECTION_IDS };
