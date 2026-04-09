import { useEffect, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAdminAuthStore } from './store/authStore';

const LoginPage = lazy(() => import('./modules/auth/LoginPage'));
const AdminDashboard = lazy(() => import('./modules/dashboard/AdminDashboard'));
const ClientsPage = lazy(() => import('./modules/clients/ClientsPage'));
const UsersPage = lazy(() => import('./modules/users/UsersPage'));
const SettingsPage = lazy(() => import('./modules/settings/SettingsPage'));

import MainLayout from './components/layout/MainLayout';

const PageLoader = () => (
  <div className="min-h-screen bg-surface-base flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const AppContent = () => {
  const { user, loading, profile, setUser } = useAdminAuthStore();

  const fetchProfile = async (u: any, s: any) => {
    console.log('🔄 Cargando perfil para:', u.email);
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', u.id)
      .single();
    
    if (error) {
      console.error('❌ Error al cargar perfil:', error);
    }
    setUser(u, s, profile || null);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Cambio de Auth:', event, session?.user?.email);
      if (session?.user) {
        fetchProfile(session.user, session);
      } else {
        setUser(null, null, null);
      }
    });

    // Carga inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user, session);
      } else {
        setUser(null, null, null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  // Si estamos cargando el usuario O recuperando el perfil, mostramos el loader
  if (loading || (user && !profile)) return <PageLoader />;

  return (
    <div className="min-h-screen bg-surface-base text-text-primary selection:bg-primary/30">
      <Suspense fallback={<PageLoader />}>
        {!user ? (
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          <MainLayout>
            <Routes>
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </MainLayout>
        )}
      </Suspense>
    </div>
  );
};

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;
