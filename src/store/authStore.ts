'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = { id: string; email: string; name?: string } | null;

interface AuthState {
  user: User;
  loading: boolean;
  setUser: (u: User) => void;
  login: (email: string, password: string, remember?: boolean) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      setUser: (u) => set({ user: u }),

      login: async (email, password) => {
        set({ loading: true });
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (!res.ok) return { ok: false, error: data.error || 'Login failed' };
          const user = data.user || (await (await fetch('/api/auth/me')).json()).user;
          set({ user, loading: false });
          return { ok: true };
        } catch (err: any) {
          return { ok: false, error: err?.message || 'Login error' };
        } finally {
          set({ loading: false });
        }
      },

      signup: async (name, email, password) => {
        set({ loading: true });
        try {
          const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ name, email, password }),
          });
          const data = await res.json();
          if (!res.ok) return { ok: false, error: data.error || 'Signup failed' };
          const user = data.user || (await (await fetch('/api/auth/me')).json()).user;
          set({ user, loading: false });
          return { ok: true };
        } catch (err: any) {
          return { ok: false, error: err?.message || 'Signup error' };
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
        } catch (e) {
          // ignore
        }
        set({ user: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (s) => ({ user: s.user }),
    }
  )
);

export default useAuthStore;
