import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile } from '../types/domain';

interface AdminAuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  setUser: (user: User | null, session: Session | null, profile: UserProfile | null) => void;
  signOut: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      profile: null,
      loading: true,
      setUser: (user, session, profile) => set({ user, session, profile, loading: false }),
      signOut: async () => {
        set({ user: null, session: null, profile: null, loading: false });
      },
    }),
    {
      name: 'orderix-admin-auth',
      onRehydrateStorage: () => (state) => {
        if (state) state.loading = false;
      },
    }
  )
);
