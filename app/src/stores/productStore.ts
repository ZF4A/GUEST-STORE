import { create } from 'zustand';
import { supabase, uploadToStorage } from '@/lib/supabase';
import { getBlob, isIdb, isIdbVideo } from '@/lib/imageDb';
import { products as SEED } from '@/lib/data';
import type { Product } from '@/types';

interface ProductState {
  products: Product[];
  loading:  boolean;
  seeded:   boolean;
  seed:          () => Promise<void>;
  addProduct:    (p: Product) => Promise<void>;
  updateProduct: (id: string, patch: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
}

/** Upload a local idb:// blob to Supabase Storage and return the public URL. */
async function liftToCloud(src: string): Promise<string> {
  if (!isIdb(src) && !isIdbVideo(src)) return src;
  try {
    const blob = await getBlob(src);
    if (!blob) return src;
    return await uploadToStorage(blob);
  } catch { return src; }
}

async function liftProduct(p: Product): Promise<Product> {
  const image  = await liftToCloud(p.image);
  const images = p.images ? await Promise.all(p.images.map(liftToCloud)) : undefined;
  const videos = p.videos ? await Promise.all(p.videos.map(liftToCloud)) : undefined;
  return { ...p, image, images, videos };
}

/** Read admin-added products from this browser's localStorage. */
function readLocalAdminProducts(): Product[] {
  try {
    const raw    = localStorage.getItem('quest-products-v2');
    const parsed = JSON.parse(raw ?? '{}');
    const all: Product[] = parsed?.state?.products ?? [];
    // Only products the admin explicitly created (id starts with "admin-")
    // — never overwrite Supabase with customer-side seed data
    return all.filter(p => p.id.startsWith('admin-'));
  } catch { return []; }
}

export const useProductStore = create<ProductState>()((set, get) => ({
  products: [],
  loading:  false,
  seeded:   false,

  seed: async () => {
    if (get().seeded || get().loading) return;
    set({ loading: true });

    try {
      // ── 1. Fetch current state from Supabase ──────────────────────────────
      const { data, error } = await supabase
        .from('products')
        .select('data')
        .order('updated_at', { ascending: true });

      if (error) throw error;

      // ── 2. Migrate any local admin products not yet in Supabase ──────────
      const localAdmin   = readLocalAdminProducts();
      const existingIds  = new Set((data ?? []).map((r: { data: Product }) => r.data.id));
      const toMigrate    = localAdmin.filter(p => !existingIds.has(p.id));

      if (toMigrate.length > 0) {
        const migrated = await Promise.all(toMigrate.map(liftProduct));
        await supabase.from('products').upsert(
          migrated.map(p => ({ id: p.id, data: p, updated_at: new Date().toISOString() }))
        );
        // Merge migrated into the fetched list
        (data ?? []).push(...migrated.map(p => ({ data: p })));
      }

      // ── 3. If Supabase is completely empty, seed the static products ──────
      if (!data || data.length === 0) {
        await supabase.from('products').upsert(
          SEED.map(p => ({ id: p.id, data: p, updated_at: new Date().toISOString() }))
        );
        set({ products: [...toMigrate, ...SEED], loading: false, seeded: true });
        return;
      }

      // ── 4. Use Supabase as source of truth ────────────────────────────────
      const products = (data as { data: Product }[]).map(r => r.data);
      set({ products, loading: false, seeded: true });

    } catch (err) {
      console.error('Supabase seed error:', err);
      // Never show a blank store — fall back to static data
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
