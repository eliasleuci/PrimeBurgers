import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Store, 
  TrendingUp, 
  Activity,
  Globe,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { adminService } from '../../services/adminService';
import type { Tenant, Branch } from '../../types/domain';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalBranches: 0,
    activeSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const { data: tenants } = await adminService.getTenants();
      const { data: branches } = await adminService.getBranches();
      
      if (tenants) {
        setStats({
          totalClients: tenants.length,
          totalBranches: branches?.length || 0,
          activeSubscriptions: tenants.filter(t => t.subscription_status === 'ACTIVE').length
        });
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Clientes', value: stats.totalClients, icon: <Globe />, color: 'bg-blue-500/10 text-blue-500' },
    { label: 'Sucursales Totales', value: stats.totalBranches, icon: <Store />, color: 'bg-primary/10 text-primary' },
    { label: 'Suscripciones Activas', value: stats.activeSubscriptions, icon: <Activity />, color: 'bg-emerald-500/10 text-emerald-500' },
    { label: 'Crecimiento Mes', value: '+12%', icon: <TrendingUp />, color: 'bg-purple-500/10 text-purple-500' },
  ];

  return (
    <div className="space-y-12">
      {/* WELCOME */}
      <header>
        <div className="flex items-center gap-3 mb-2">
           <Badge variant="primary" size="sm">Super Administrador</Badge>
           <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-success" />
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">Status: Online</span>
           </div>
        </div>
        <h1 className="text-5xl font-black tracking-tight text-text-primary uppercase leading-tight">
          Panel de <span className="text-primary italic">Control</span>
        </h1>
        <p className="text-text-secondary font-bold text-lg mt-2 italic">Bienvenido, Elias. Aquí tienes el resumen global de Orderix.</p>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card padding="large" className="group relative overflow-hidden h-full border-border-subtle hover:border-primary/30 transition-all duration-500">
               <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-8 -mt-8 group-hover:bg-primary/10 transition-all" />
               <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center mb-6`}>
                 {React.cloneElement(stat.icon as React.ReactElement, { size: 24 })}
               </div>
               <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
               <h3 className="text-4xl font-black text-text-primary tracking-tighter">
                 {loading ? '...' : stat.value}
               </h3>
               <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-success uppercase">
                 <ArrowUpRight size={14} /> 
                 <span>Incremento detectado</span>
               </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* RECENT ACTIVITY PLACEHOLDER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="lg:col-span-2 border-border-subtle" title="Actividad Reciente">
            <div className="space-y-6">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-surface-base flex items-center justify-center text-text-muted">
                          <Users size={18} />
                       </div>
                       <div>
                          <p className="text-sm font-black text-text-primary uppercase">Nuevo Cliente Registrado</p>
                          <p className="text-[10px] font-bold text-text-muted uppercase">Hace {i * 2} horas</p>
                       </div>
                    </div>
                    <Badge variant="ghost" size="sm">Ver</Badge>
                 </div>
               ))}
            </div>
         </Card>
         
         <Card className="border-border-subtle bg-primary/5 border-dashed border-primary/20 flex flex-col items-center justify-center text-center p-12">
            <div className="w-16 h-16 bg-primary/20 rounded-3xl flex items-center justify-center text-primary mb-6">
               <TrendingUp size={32} />
            </div>
            <h4 className="text-lg font-black text-text-primary uppercase mb-2">Reporte Semanal</h4>
            <p className="text-xs text-text-secondary font-bold leading-relaxed">Próximamente: Visualiza gráficos de crecimiento y métricas de uso por sucursal.</p>
         </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
