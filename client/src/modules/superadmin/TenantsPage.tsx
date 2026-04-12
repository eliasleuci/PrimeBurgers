import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Building2, Key, ShieldAlert, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { baseApi } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Toast from '../../components/Toast';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  // Form states
  const [newTenantData, setNewTenantData] = useState({ name: '', slug: '', adminEmail: '', adminPassword: '' });
  const [passwordData, setPasswordData] = useState({ newPassword: '' });
  
  // UI states
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await baseApi.get('/tenants');
      setTenants(res.data?.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener restaurantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await baseApi.post('/tenants', newTenantData);
      setSuccess('Restaurante creado exitosamente');
      setIsCreateOpen(false);
      setNewTenantData({ name: '', slug: '', adminEmail: '', adminPassword: '' });
      fetchTenants();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear restaurante');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (tenantId: string, currentStatus: boolean) => {
    try {
      await baseApi.patch(`/tenants/${tenantId}/status`, { isActive: !currentStatus });
      setSuccess(`Restaurante ${!currentStatus ? 'activado' : 'desactivado'}`);
      fetchTenants();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar el estado');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    
    setActionLoading(true);
    try {
      await baseApi.post(`/tenants/${selectedTenant.id}/reset-password`, passwordData);
      setSuccess('Contraseña actualizada exitosamente');
      setIsPasswordOpen(false);
      setPasswordData({ newPassword: '' });
      setSelectedTenant(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al restablecer contraseña');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">Registro de Restaurantes</h1>
          <p className="text-white/50 font-medium mt-2">Gestiona todas las instancias del sistema</p>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20"
          leftIcon={<Plus size={18} />}
        >
          Nuevo Restaurante
        </Button>
      </div>

      {/* Analytics / Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
              <Building2 className="text-indigo-400" size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-white/50 uppercase tracking-widest">Registrados</p>
              <p className="text-3xl font-black text-white">{tenants.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/10 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="text-emerald-400" size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-white/50 uppercase tracking-widest">Activos</p>
              <p className="text-3xl font-black text-emerald-400">
                {tenants.filter(t => t.isActive).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-red-500/5 border-red-500/10 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
              <XCircle className="text-red-400" size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-white/50 uppercase tracking-widest">Inactivos</p>
              <p className="text-3xl font-black text-red-400">
                {tenants.filter(t => !t.isActive).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Table Area */}
      <Card className="bg-white/5 border-white/10 p-0 overflow-hidden backdrop-blur-xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Registered Instances</h2>
          <div className="w-72 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="Buscar restaurantes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-xs uppercase tracking-widest font-bold text-white/50">
                <th className="p-4 pl-6">Restaurante</th>
                <th className="p-4">Identificador (Slug)</th>
                <th className="p-4">Creado en</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 pr-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <Loader2 className="animate-spin text-indigo-500 mx-auto" size={32} />
                  </td>
                </tr>
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-white/40 font-medium">
                    No hay restaurantes registrados
                  </td>
                </tr>
              ) : (
                filteredTenants.map((t) => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 pl-6 font-black text-white">{t.name}</td>
                    <td className="p-4 text-white/70 font-mono text-sm">{t.slug}</td>
                    <td className="p-4 text-white/50 text-sm">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        t.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${t.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {t.isActive ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="p-4 pr-6 flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        className="text-white/60 hover:text-white"
                        onClick={() => handleToggleStatus(t.id, t.isActive)}
                      >
                        <ShieldAlert size={16} className={t.isActive ? 'text-red-400' : 'text-emerald-400'} />
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-white/60 hover:text-indigo-400"
                        onClick={() => {
                          setSelectedTenant(t);
                          setIsPasswordOpen(true);
                        }}
                      >
                        <Key size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Creación Modal (Simplified CSS based) */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsCreateOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#121214] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 bg-white/5">
                <h3 className="text-xl font-black text-white">Registrar Nuevo Restaurante</h3>
                <p className="text-xs text-white/50 uppercase tracking-widest font-bold mt-1">Aprovisionar instancia</p>
              </div>
              <form onSubmit={handleCreateTenant} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Nombre del Restaurante</label>
                  <input
                    type="text"
                    required
                    value={newTenantData.name}
                    onChange={(e) => setNewTenantData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/50"
                    placeholder="Ej. McDonald's Centro"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Identificador Único</label>
                  <input
                    type="text"
                    required
                    value={newTenantData.slug}
                    onChange={(e) => setNewTenantData(prev => ({ ...prev, slug: e.target.value.toLowerCase() }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/50 font-mono"
                    placeholder="mcdonalds-dt"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Email de Administrador</label>
                  <input
                    type="email"
                    required
                    value={newTenantData.adminEmail}
                    onChange={(e) => setNewTenantData(prev => ({ ...prev, adminEmail: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/50"
                    placeholder="admin@restaurant.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Contraseña de Administrador</label>
                  <input
                    type="password"
                    required
                    value={newTenantData.adminPassword}
                    onChange={(e) => setNewTenantData(prev => ({ ...prev, adminPassword: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/50"
                    placeholder="Mín. 6 caracteres"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="ghost" className="text-white/60" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" isLoading={actionLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                    Crear Restaurante
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isPasswordOpen && selectedTenant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsPasswordOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#121214] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 bg-white/5">
                <h3 className="text-xl font-black text-white">Restablecer Contraseña</h3>
                <p className="text-xs text-white/50 uppercase tracking-widest font-bold mt-1">Restaurante: {selectedTenant.name}</p>
              </div>
              <form onSubmit={handleResetPassword} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Nueva Contraseña</label>
                  <input
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/50"
                    placeholder="Mín. 6 caracteres"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="ghost" className="text-white/60" onClick={() => setIsPasswordOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" isLoading={actionLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                    Guardar Cambios
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Toast message={error} type="error" isVisible={!!error} onClose={() => setError('')} />
      <Toast message={success} type="success" isVisible={!!success} onClose={() => setSuccess('')} />
    </div>
  );
}
