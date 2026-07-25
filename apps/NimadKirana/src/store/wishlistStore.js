import { create } from 'zustand';

export const useWishlistStore = create((set, get) => ({
  ids: [],
  toggle: (id) => {
    const ids = get().ids.includes(id)
      ? get().ids.filter((x) => x !== id)
      : [...get().ids, id];
    set({ ids });
  },
}));
