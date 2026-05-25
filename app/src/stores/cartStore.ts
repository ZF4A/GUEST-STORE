import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, DeliveryZone } from '@/types';

export const DELIVERY_FEES: Record<DeliveryZone, number> = {
  yaounde:       1000,
  kribi:         1000,
  autre_ville:   2500,
  international: 7500,
};

function computeTotals(items: CartItem[], zone: DeliveryZone) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const deliveryFee = DELIVERY_FEES[zone];
  const total = subtotal + deliveryFee;
  return { subtotal, totalItems, deliveryFee, total };
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  subtotal: number;
  deliveryZone: DeliveryZone;
  deliveryFee: number;
  total: number;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (itemId: string) => void;
  updateQty: (itemId: string, qty: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  setDeliveryZone: (zone: DeliveryZone) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      totalItems: 0,
      subtotal: 0,
      deliveryZone: 'yaounde',
      deliveryFee: 1000,
      total: 1000,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.store === item.store
          );
          let newItems: CartItem[];
          if (existing) {
            newItems = state.items.map((i) =>
              i.productId === item.productId && i.store === item.store
                ? { ...i, qty: i.qty + item.qty }
                : i
            );
          } else {
            newItems = [
              ...state.items,
              { ...item, id: `${item.productId}-${item.store}-${Date.now()}` },
            ];
          }
          return {
            items: newItems,
            ...computeTotals(newItems, state.deliveryZone),
            isOpen: true,
          };
        }),

      removeItem: (itemId) =>
        set((state) => {
          const newItems = state.items.filter((i) => i.id !== itemId);
          return { items: newItems, ...computeTotals(newItems, state.deliveryZone) };
        }),

      updateQty: (itemId, qty) =>
        set((state) => {
          const newItems =
            qty <= 0
              ? state.items.filter((i) => i.id !== itemId)
              : state.items.map((i) => (i.id === itemId ? { ...i, qty } : i));
          return { items: newItems, ...computeTotals(newItems, state.deliveryZone) };
        }),

      clearCart: () =>
        set((state) => ({
          items: [],
          ...computeTotals([], state.deliveryZone),
        })),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setCartOpen: (open) => set({ isOpen: open }),

      setDeliveryZone: (zone) =>
        set((state) => ({
          deliveryZone: zone,
          ...computeTotals(state.items, zone),
        })),
    }),
    {
      name: 'quest-store-cart',
      partialize: (state) => ({ items: state.items, deliveryZone: state.deliveryZone }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const computed = computeTotals(state.items, state.deliveryZone);
          Object.assign(state, computed);
        }
      },
    }
  )
);
