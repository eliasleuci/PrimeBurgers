import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminAuthStore } from '../../store/authStore';
import Badge from '../ui/Badge';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { signOut, profile } = useAdminAuthStore();

  const menuItems = [
    { icon: <LayoutDashboard size={22} />, label: 'Panel Control', path: '/dashboard' },
    { icon: <Store size={22} />, label: 'Clientes', path: '/clients' },
    { icon: <Users size={22} />, label: 'Usuarios', path: '/users' },
    { icon: <Settings size={22} />, label: 'Configuración', path: '/settings' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="h-screen bg-surface-elevated border-r border-border-subtle flex flex-col sticky top-0 z-50 transition-all duration-500 ease-in-out"
    >
      {/* LOGO AREA */}
      <div className="p-6 h-28 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-text-primary uppercase tracking-tighter">
                Orderix <span className="text-primary italic">ADM</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
               <ShieldCheck size={12} className="text-success" />
               <span className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">Super Admin</span>
            </div>
          </motion.div>
        )}
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-8 h-8 rounded-lg bg-surface-base border border-border-subtle flex items-center justify-center text-text-muted hover:text-primary transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 space-y-1 mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative
              ${isActive 
                ? 'bg-primary/10 text-primary font-black shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.1)]' 
                : 'text-text-secondary hover:bg-surface-base hover:text-text-primary font-bold'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center justify-center min-w-[24px]">
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm uppercase tracking-wider"
                  >
                    {item.label}
                  </motion.span>
                )}
                
                {/* Active Indicator Bar */}
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* FOOTER / USER */}
      <div className="p-4 mt-auto border-t border-border-subtle">
        <div className="flex items-center gap-4 px-2 py-4 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black">
            {profile?.email?.[0].toUpperCase() || 'A'}
          </div>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col min-w-0"
            >
              <span className="text-xs font-black text-text-primary truncate uppercase">{profile?.email?.split('@')[0]}</span>
              <span className="text-[10px] font-bold text-text-muted truncate uppercase tracking-widest">{profile?.role}</span>
            </motion.div>
          )}
        </div>
        
        <button
          onClick={signOut}
          className={`
            w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-danger hover:bg-danger/10 transition-all duration-300 font-black uppercase tracking-wider
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut size={22} />
          {!isCollapsed && <span className="text-sm">Salir</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
