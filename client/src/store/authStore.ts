import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  role: 'ADMIN' | 'CASHIER' | 'KITCHEN' | null;
  branchId: string | null;
  loading: boolean;
  setUser: (user: User | null, session: Session | null, role?: 'ADMIN' | 'CASHIER' | 'KITCHEN' | null) => void;
  setBranchId: (id: string | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null, // Zustand persist will hydrate this
      session: null,
      role: null,
      branchId: null,
      loading: true,
      setUser: (user, session, role = null) => set({ user, session, role, loading: false }),
      setBranchId: (id) => set({ branchId: id }),
      signOut: async () => {
        try {
          await supabase.auth.signOut();
        } catch (e) { /* ignore in mock */ }
        set({ user: null, session: null, branchId: null, loading: false });
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        useAuthStore.setState({ loading: false });
      },
    }
  )
);
