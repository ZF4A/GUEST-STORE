import { create } from 'zustand';
import { supabase, uploadToStorage } from '@/lib/supabase';
import { getBlob, isIdb, isIdbVideo } from '@/lib/imageDb';
import { products as SEED } from '@/lib/data';
import type { Product } from '@/types';

interface ProductState {
  products: Product[];
  loading: boolean;
  seeded: boolean;
  seed: () => Promise<void>;
  addProduct:    (p: Product) => Promise<void>;
  updateProduct: (id: string, patch: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
}

/** Upload an idb:// or idbv:// local blob to Supabase Storage → return public URL. */
async function liftToCloud(src: string): Promise<string> {
  if (!isIdb(src) && !isIdbVideo(src)) return src;
  try {
    const blob = await getBlob(src);
    if (!blob) return src;
    return await uploadToStorage(blob);
  } catch {
    return src;
  }
}

/** Migrate all idb:// refs in a product to public Supabase Storage URLs. */
async function liftProduct(p: Product): Promise<Product> {
  const image  = await liftToCloud(p.image);
  const images = p.images ? await Promise.all(p.images.map(liftToCloud)) : undefined;
  const videos = p.videos ? await Promise.all(p.videos.map(liftToCloud)) : undefined;
  return { ...p, image, images, videos };
}

export const useProductStore = create<ProductState>()((set, get) => ({
  products: [],
  loading:  false,
  seeded:   false,

  seed: async () => {
    if (get().seeded || get().loading) return;
    set({ loading: true });

    try {
      const { data, error } = await supabase
        .from('products')
        .select('data')
        .order('updated_at', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        // ── First run: migrate admin's local products + seed static ones ──
        let localProducts: Product[] = [];
        try {
          const raw = localStorage.getItem('quest-products-v2');
          const parsed = JSON.parse(raw ?? '{}');
          const all: Product[] = parsed?.state?.products ?? [];
          // Only keep admin-added products (not the static seed ones)
          localProducts = all.filter(p => !SEED.find(s => s.id === p.id));
        } catch { /* ignore */ }

        // Upload any idb:// images/videos to Supabase Storage
        const migrated = await Promise.all(localProducts.map(liftProduct));

        // Combine: admin products first (newest), then static seed
        const combined = [...migrated, ...SEED];

        await supabase.from('products').upsert(
          combined.map(p => ({ id: p.id, data: p, updated_at: new Date().toISOString() }))
        );

        set({ products: combined, loading: false, seeded: true });
      } else {
        const products = (data as { data: Product }[]).map(r => r.data);
        set({ products, loading: false, seeded: true });
      }
    } catch (err) {
      console.error('Supabase seed error:', err);
      // Fallback: show static products so site never goes blank
      set({ products: SEED, loading: false, seeded: true });
    }
  },

  addProduct: async (p) => {
    await supabase.from('products').insert({
      id: p.id, data: p, updated_at: new Date().toISOString(),
    });
    set(s => ({ products: [p, ...s.products] }));
  },

  updateProduct: async (id, patch) => {
    const existing = get().products.find(p => p.id === id);
    if (!existing) return;
    const updated = { ...existing, ...patch };
    await supabase.from('products')
      .update({ data: updated, updated_at: new Date().toISOString() })
      .eq('id', id);
    set(s => ({ products: s.products.map(p => p.id === id ? updated : p) }));
  },

  removeProduct: async (id) => {
    await supabase.from('products').delete().eq('id', id);
    set(s => ({ products: s.products.filter(p => p.id !== id) }));
  },
}));
