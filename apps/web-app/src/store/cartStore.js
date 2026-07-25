import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { product, variant, qty }

      addItem: (product, variant, qty = 1) => {
        const items = [...get().items];
        const idx = items.findIndex((i) => i.variant.id === variant.id);
        if (idx >= 0) {
          items[idx] = { ...items[idx], qty: items[idx].qty + qty };
        } else {
          items.push({ product, variant, qty });
        }
        set({ items });
      },

      updateQty: (variantId, qty) => {
        if (qty <= 0) {
          set({ items: get().items.filter((i) => i.variant.id !== variantId) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.variant.id === variantId ? { ...i, qty } : i,
          ),
        });
      },

      removeItem: (variantId) =>
        set({ items: get().items.filter((i) => i.variant.id !== variantId) }),

      clear: () => set({ items: [] }),
    }),
    { name: 'nimad-cart' },
  ),
);
