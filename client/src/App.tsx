import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';
import { cn } from './lib/utils';
import LoginPage from './modules/auth/LoginPage';
import POSPage from './modules/pos/POSPage';
import KitchenPage from './modules/kitchen/KitchenPage';
import DashboardPage from './modules/dashboard/DashboardPage';
import CatalogPage from './modules/catalog/CatalogPage';
import Sidebar from './layouts/Sidebar';

// Componente para manejar el Layout condicional
const AppContent = () => {
  const { user, loading, setUser, role } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null, session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null, session);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isKitchenRoute = location.pathname === '/kitchen';
  // Solo ocultamos el sidebar si estamos en cocina Y el rol es KITCHEN o no hay usuario
  const shouldHideSidebar = isKitchenRoute && (role === 'KITCHEN' || !user);

  return (
    <div className="flex h-screen overflow-hidden">
      {user && !shouldHideSidebar && <Sidebar />}
      <main className={cn("flex-1 overflow-auto bg-slate-950", shouldHideSidebar && "w-full")}>
        {!user ? (
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/kitchen" element={<KitchenPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/pos" element={<POSPage />} />
            <Route path="/kitchen" element={<KitchenPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="*" element={<Navigate to="/pos" replace />} />
          </Routes>
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
