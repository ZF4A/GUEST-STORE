import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface SectionTitle {
  caption: string;
  headline: string;
}

const SECTION_IDS = ['trending', 'bestsellers', 'newarrivals', 'sold', 'premium'] as const;
export type SectionId = typeof SECTION_IDS[number];

const CONFIG_KEY = 'section-titles';

interface SectionState {
  overrides: Partial<Record<SectionId, SectionTitle>>;
  loaded:    boolean;
  load:      () => Promise<void>;
  setTitle:  (id: SectionId, title: SectionTitle) => Promise<void>;
  resetTitle:(id: SectionId) => Promise<void>;
  resetAll:  () => Promise<void>;
}

async function persist(overrides: Partial<Record<SectionId, SectionTitle>>) {
  await supabase.from('site_config').upsert({
    key: CONFIG_KEY,
    data: { overrides },
    updated_at: new Date().toISOString(),
  });
}

export const useSectionStore = create<SectionState>()((set, get) => ({
  overrides: {},
  loaded:    false,

  load: async () => {
    if (get().loaded) return;
    try {
      const { data } = await supabase
        .from('site_config')
        .select('data')
        .eq('key', CONFIG_KEY)
        .single();
      const overrides = data?.data?.overrides ?? {};
      set({ overrides, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  setTitle: async (id, title) => {
    const overrides = { ...get().overrides, [id]: title };
    set({ overrides });
    await persist(overrides);
  },

  resetTitle: async (id) => {
    const overrides = { ...get().overrides };
    delete overrides[id];
    set({ overrides });
    await persist(overrides);
  },

  resetAll: async () => {
    set({ overrides: {} });
    await persist({});
  },
}));

export { SECTION_IDS };
