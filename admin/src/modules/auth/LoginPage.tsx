import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdminAuthStore } from '../../store/authStore';
import { ShieldCheck, Mail, Lock, LogIn, Server } from 'lucide-react';
import { motion } from 'framer-motion';
import { ANIMATIONS } from '../../lib/motion';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { setUser } = useAdminAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: { user, session }, error: authError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (user) {
      // Verificar que el usuario tenga rol SUPER_ADMIN
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Error cargando perfil:', profileError);
        setError('Error de conexión con el servidor (406/500). Intenta recargar.');
        setLoading(false);
        return;
      }

      if (profile?.role !== 'SUPER_ADMIN') {
        setError('Acceso denegado. Se requiere privilegios de Super Admin.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      setUser(user, session, profile as any);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background FX */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.03),transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
      
      <motion.div 
        {...ANIMATIONS.fadeInUp}
        className="w-full max-w-lg z-10"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-2xl shadow-primary/5">
            <Server className="text-primary" size={40} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-text-primary uppercase">
            Orderix <span className="text-primary">Admin</span>
          </h1>
          <p className="text-text-muted font-bold mt-2 uppercase tracking-[0.2em] text-[10px]">
            Master Control Interface
          </p>
        </div>

        <Card variant="glass" padding="large">
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              label="Acceso Root (Email)"
              type="email"
              placeholder="admin@orderix.com"
              icon={<Mail size={20} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Clave de Seguridad"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={20} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="p-4 bg-danger/10 border border-danger/20 rounded-2xl flex items-center gap-3 text-danger text-xs font-bold animate-pulse">
                <ShieldCheck size={18} />
                {error}
              </div>
            )}

            <Button
              type="submit"
              isLoading={loading}
              fullWidth
              size="lg"
              leftIcon={<LogIn size={20} />}
            >
              Iniciar Sesión Admin
            </Button>
          </form>
        </Card>

        <footer className="mt-8 text-center">
          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-40">
            Authorized Personnel Only • Orderix Systems v1.0
          </span>
        </footer>
      </motion.div>
    </div>
  );
};

export default LoginPage;
