import { create } from 'zustand';
import { type User, setAccessToken, authApi } from '@/lib/api';

let authInitStarted = false;

const SESSION_COOKIE = 'roastcoder_session';

function setSessionCookie(active: boolean) {
  if (typeof document === 'undefined') return;
  if (active) {
    document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=604800; SameSite=Lax`;
  } else {
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
  }
}

interface UserStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),

  login: (user, token) => {
    setAccessToken(token);
    setSessionCookie(true);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    setAccessToken(null);
    setSessionCookie(false);
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.me();
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      setAccessToken(null);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  initializeAuth: async () => {
    if (authInitStarted) return;
    authInitStarted = true;

    set({ isLoading: true });
    try {
      const { data } = await authApi.me();
      setSessionCookie(true);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return;
    } catch {
      // access token missing or expired — try refresh
    }

    try {
      const { data } = await authApi.refresh();
      setAccessToken(data.accessToken);
      const { data: meData } = await authApi.me();
      setSessionCookie(true);
      set({ user: meData.user, isAuthenticated: true, isLoading: false });
    } catch {
      setAccessToken(null);
      setSessionCookie(false);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
