import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Utensils, ChefHat, LogOut, Store, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { signOut } = useAuthStore();

  const menuItems = [
    { path: '/pos', icon: <Utensils />, label: 'Ventas' },
    { path: '/kitchen', icon: <ChefHat />, label: 'Cocina' },
    { path: '/catalog', icon: <BookOpen />, label: 'Catálogo' },
    { path: '/dashboard', icon: <LayoutDashboard />, label: 'Panel' },
  ];

  return (
    <aside className="w-24 bg-surface-base border-r border-white/5 flex flex-col items-center py-8 justify-between relative z-50">
      <div className="space-y-10 flex flex-col items-center w-full">
        {/* LOGO AREA */}
        <div className="w-14 h-14 bg-primary/10 rounded-[1.2rem] flex items-center justify-center shadow-2xl border border-primary/20 mb-4 transition-transform hover:scale-110">
          <Store className="text-primary" size={28} />
        </div>

        {/* NAVIGATION */}
        <nav className="flex flex-col gap-8 w-full px-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className="group relative flex flex-col items-center gap-1.5"
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border",
                  isActive 
                    ? 'bg-primary text-surface-base shadow-xl border-primary/50' 
                    : 'text-text-muted hover:bg-white/5 border-transparent hover:border-white/10'
                )}>
                  {React.cloneElement(item.icon as React.ReactElement<any>, { size: 24 })}
                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-[0.1em] transition-all",
                  isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator" 
                    className="absolute -right-2 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-primary rounded-l-full shadow-[0_0_15px_rgba(245,158,11,0.5)]" 
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* SIGN OUT */}
      <button 
        onClick={signOut}
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-text-muted hover:bg-danger/10 hover:text-danger transition-all border border-transparent hover:border-danger/20 group"
      >
        <LogOut size={24} className="transition-transform group-hover:-translate-x-1" />
      </button>
    </aside>
  );
};

export default Sidebar;
