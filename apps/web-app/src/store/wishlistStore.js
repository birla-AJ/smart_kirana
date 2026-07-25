import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const ids = get().ids.includes(id) ? get().ids.filter((x) => x !== id) : [...get().ids, id];
        set({ ids });
      },
    }),
    { name: 'nimad-wishlist' },
  ),
);
