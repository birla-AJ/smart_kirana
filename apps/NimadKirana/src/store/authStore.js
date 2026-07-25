import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isHydrated: false,

  hydrate: async () => {
    const [user, accessToken, refreshToken] = await Promise.all([
      AsyncStorage.getItem('user'),
      AsyncStorage.getItem('accessToken'),
      AsyncStorage.getItem('refreshToken'),
    ]);
    set({
      user: user ? JSON.parse(user) : null,
      accessToken,
      refreshToken,
      isHydrated: true,
    });
  },

  setSession: async ({ user, accessToken, refreshToken }) => {
    await AsyncStorage.multiSet([
      ['user', JSON.stringify(user ?? {})],
      ['accessToken', accessToken ?? ''],
      ['refreshToken', refreshToken ?? ''],
    ]);
    set({ user, accessToken, refreshToken });
  },

  clearSession: async () => {
    await AsyncStorage.multiRemove(['user', 'accessToken', 'refreshToken']);
    set({ user: null, accessToken: null, refreshToken: null });
  },
}));
