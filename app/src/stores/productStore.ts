import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { products as SEED } from '@/lib/data';
import type { Product } from '@/types';

interface ProductState {
  products: Product[];
  seeded: boolean;
  seed: () => void;
  addProduct: (p: Product) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  removeProduct: (id: string) => void;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],
      seeded: false,

      seed: () => {
        if (get().seeded) return;

        // Migrate any products from old store key (quest-extra-products)
        let migrated: Product[] = [];
        try {
          const old = localStorage.getItem('quest-extra-products');
          if (old) {
            const parsed = JSON.parse(old);
            if (Array.isArray(parsed?.state?.extraProducts)) {
              migrated = parsed.state.extraProducts;
            }
            localStorage.removeItem('quest-extra-products');
          }
        } catch {
          // ignore migration errors
        }

        set({
          products: [...migrated, ...SEED],
          seeded: true,
        });
      },

      addProduct: (p) =>
        set((s) => ({ products: [p, ...s.products] })),

      updateProduct: (id, patch) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, ...patch } : p
          ),
        })),

      removeProduct: (id) =>
        set((s) => ({
          products: s.products.filter((p) => p.id !== id),
        })),
    }),
    { name: 'quest-products-v2' }
  )
);
