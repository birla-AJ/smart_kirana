import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [], // { variantId, product, variant, qty }

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

  removeItem: (variantId) => {
    set({ items: get().items.filter((i) => i.variant.id !== variantId) });
  },

  clear: () => set({ items: [] }),

  get totalItems() {
    return get().items.reduce((sum, i) => sum + i.qty, 0);
  },

  get totalAmount() {
    return get().items.reduce(
      (sum, i) => sum + i.qty * Number(i.variant.sellingPrice || 0),
      0,
    );
  },
}));
