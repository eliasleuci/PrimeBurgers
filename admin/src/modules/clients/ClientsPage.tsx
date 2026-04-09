import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Globe, 
  Mail, 
  Phone, 
  ChevronRight, 
  Store, 
  MapPin, 
  Trash2, 
  Calendar,
  Lock,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../../services/adminService';
import type { Tenant, Branch } from '../../types/domain';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';

const ClientsPage: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  
  // States para el modal
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    adminEmail: '',
    adminPassword: '',
    subscription_status: 'ACTIVE' as const,
    subscription_expires_at: ''
  });

  const [tenantBranches, setTenantBranches] = useState<Branch[]>([]);
  const [newBranch, setNewBranch] = useState({ name: '', location: '' });

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    const { data, error } = await adminService.getTenants();
    if (error) {
      alert(`Error al cargar clientes: ${error}`);
    }
    if (data) setTenants(data);
    setLoading(false);
  };

  const loadBranches = async (tenantId: string) => {
    const { data, error } = await adminService.getBranches(tenantId);
    if (error) {
      console.error('Error al cargar sucursales:', error);
    }
    if (data) setTenantBranches(data);
  };

  const handleOpenCreate = () => {
    setEditingTenant(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      adminEmail: '',
      adminPassword: '',
      subscription_status: 'ACTIVE',
      subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setTenantBranches([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({ 
      name: tenant.name, 
      email: tenant.email || '',
      phone: tenant.phone || '',
      adminEmail: '',
      adminPassword: '',
      subscription_status: tenant.subscription_status,
      subscription_expires_at: tenant.subscription_expires_at ? tenant.subscription_expires_at.split('T')[0] : ''
    });
    await loadBranches(tenant.id);
    setIsModalOpen(true);
  };

  const handleAddBranch = async () => {
    if (!newBranch.name) {
      alert('Por favor ingrese al menos el nombre de la sucursal.');
      return;
    }
    
    if (editingTenant) {
      setLoading(true);
      const { error } = await adminService.createBranch({
        tenant_id: editingTenant.id,
        name: newBranch.name,
        location: newBranch.location,
        subscription_status: 'ACTIVE'
      });
      
      if (error) {
        alert(`Error al agregar sucursal: ${error}`);
      } else {
        await loadBranches(editingTenant.id);
        setNewBranch({ name: '', location: '' });
      }
      setLoading(false);
    } else {
      alert('Primero guarde el cliente principal para empezar a añadir sucursales.');
    }
  };

  const handleDeleteBranch = async (id: string) => {
    if (!confirm('¿Seguro que desea eliminar esta sucursal?')) return;
    setLoading(true);
    const { error } = await adminService.deleteBranch(id);
    if (error) {
      alert(`Error al eliminar sucursal: ${error}`);
    } else if (editingTenant) {
      await loadBranches(editingTenant.id);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (editingTenant) {
      // Actualizar cliente existente
      const { data, error } = await adminService.updateTenant(editingTenant.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subscription_status: formData.subscription_status,
        subscription_expires_at: new Date(formData.subscription_expires_at).toISOString()
      });
      
      if (error) {
        alert(`Error al actualizar cliente: ${error}`);
      } else if (data) {
        setTenants(tenants.map(t => t.id === data.id ? data : t));
        alert('Cliente actualizado con éxito.');
        setIsModalOpen(false);
      }
    } else {
      // Crear nuevo cliente
      const { data: tenant, error: tError } = await adminService.createTenant({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subscription_status: formData.subscription_status,
        subscription_expires_at: new Date(formData.subscription_expires_at).toISOString()
      });

      if (tError) {
        alert(`Error al crear cliente: ${tError}`);
        setLoading(false);
        return;
      }

      if (tenant) {
        // Crear perfil inicial si se proporcionó email
        if (formData.adminEmail) {
          const { error: pError } = await adminService.createProfile({
            email: formData.adminEmail,
            role: 'ADMIN',
            tenant_id: tenant.id
          });
          if (pError) alert(`Error al crear perfil de usuario: ${pError}`);
        }
        alert('Cliente creado con éxito. Recuerde crear el usuario en Auth manualmente con este mismo email.');
        await loadTenants();
        setIsModalOpen(false);
      }
    }
    
    setLoading(false);
  };

  const getStatusInfo = (t: Tenant) => {
    if (t.subscription_status === 'EXPIRED') return { label: 'Vencido', variant: 'danger' as const };
    if (t.subscription_status === 'PENDING_PAYMENT') return { label: 'Pago Pendiente', variant: 'warning' as const };
    return { label: 'Al día', variant: 'success' as const };
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="primary" size="sm">Módulo Administrativo</Badge>
            <span className="text-text-muted text-[10px] font-black uppercase tracking-widest leading-none">Gestión de Clientes</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-text-primary uppercase leading-tight">
            Nuestros <span className="text-primary italic">Clientes</span>
          </h1>
          <p className="text-text-secondary font-bold mt-1">Control de empresas, suscripciones y membresías.</p>
        </div>

        <Button 
          variant="primary" 
          leftIcon={<Plus size={20} />} 
          onClick={handleOpenCreate}
          size="lg"
          className="shadow-primary/20"
        >
          Nuevo Cliente
        </Button>
      </header>

      {/* SEARCH */}
      <div className="mb-8 max-w-md">
        <Input 
          placeholder="Buscar cliente por nombre o email..."
          icon={<Search size={20} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredTenants.length === 0 && !loading && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-20 text-center">
                <Globe size={48} className="mx-auto text-text-muted mb-4 opacity-20" />
                <p className="text-text-secondary font-bold">No se encontraron clientes.</p>
             </motion.div>
          )}
          {filteredTenants.map((tenant, idx) => {
            const status = getStatusInfo(tenant);
            return (
              <motion.div
                key={tenant.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card 
                  className="group hover:border-primary/50 transition-all duration-500 border-border-subtle bg-surface-elevated/50 hover:bg-surface-elevated cursor-pointer relative"
                  onClick={() => handleOpenEdit(tenant)}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-surface-base transition-all duration-500">
                      <Globe size={24} />
                    </div>
                    <Badge variant={status.variant} size="md">{status.label}</Badge>
                  </div>
                  
                  <h3 className="text-xl font-black text-text-primary uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">
                    {tenant.name}
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-text-secondary text-sm font-bold">
                      <Mail size={16} className="text-primary" />
                      {tenant.email || 'Sin email'}
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary text-sm font-bold">
                      <Phone size={16} className="text-primary" />
                      {tenant.phone || 'Sin teléfono'}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border-subtle flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest">
                      <Store size={14} />
                      Ver Detalles
                    </div>
                    <ChevronRight className="text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-surface-base/80 backdrop-blur-xl"
              onClick={() => !loading && setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-4xl relative z-[101] my-auto"
            >
              <Card variant="solid" padding="large" className="border-primary/20 shadow-primary/10 max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="mb-8 flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black text-text-primary uppercase tracking-tight mb-1">
                      {editingTenant ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h2>
                    <p className="text-text-secondary text-sm font-bold tracking-wide">Actualiza la información y sucursales.</p>
                  </div>
                  <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cerrar</Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                        <Globe size={14} /> Datos de la Empresa
                      </h3>
                      <div className="space-y-4">
                        <Input 
                          label="Nombre de Empresa"
                          placeholder="Ej. Prime Burgers"
                          icon={<Store size={20} />}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                        <Input 
                          label="Email Principal"
                          placeholder="admin@empresa.com"
                          icon={<Mail size={20} />}
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <Input 
                          label="Teléfono de Contacto"
                          placeholder="+54..."
                          icon={<Phone size={20} />}
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                        <Lock size={14} /> Acceso de Usuario
                      </h3>
                      <div className="space-y-4 bg-surface-elevated/50 p-6 rounded-3xl border border-border-subtle">
                        <Input 
                          label="Email de Administrador"
                          placeholder="admin@orderix.com"
                          icon={<UserPlus size={20} />}
                          value={formData.adminEmail}
                          onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                          required={!editingTenant}
                        />
                        <Input 
                          label="Contraseña Temporal"
                          type="password"
                          placeholder="••••••••"
                          icon={<Lock size={20} />}
                          value={formData.adminPassword}
                          onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                          required={!editingTenant}
                        />
                        <p className="text-[10px] text-text-muted font-bold leading-relaxed uppercase tracking-wider">
                          * Este usuario será el administrador principal para este cliente.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                      <Calendar size={14} /> Estado de Suscripción
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest pl-2">Estado de Cuenta</label>
                          <select 
                            className="w-full bg-surface-elevated border border-border-subtle rounded-2xl py-4 px-4 text-text-primary font-bold focus:outline-none focus:border-primary appearance-none"
                            value={formData.subscription_status}
                            onChange={(e) => setFormData({ ...formData, subscription_status: e.target.value as any })}
                          >
                            <option value="ACTIVE">Activa / Al día</option>
                            <option value="PENDING_PAYMENT">Pago Pendiente</option>
                            <option value="EXPIRED">Suscripción Vencida</option>
                          </select>
                       </div>
                       <Input 
                          label="Fecha de Vencimiento"
                          type="date"
                          value={formData.subscription_expires_at}
                          onChange={(e) => setFormData({ ...formData, subscription_expires_at: e.target.value })}
                       />
                    </div>
                  </div>

                  {editingTenant && (
                    <div className="space-y-6 pt-6 border-t border-border-subtle">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                          <MapPin size={14} /> Sucursales Vinculadas
                        </h3>
                        <Badge variant="primary" size="sm">{tenantBranches.length} Activadas</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tenantBranches.map(branch => (
                          <div key={branch.id} className="p-4 bg-surface-base border border-border-subtle rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all">
                            <div>
                               <p className="text-sm font-black text-text-primary uppercase tracking-tight">{branch.name}</p>
                               <p className="text-[10px] font-bold text-text-muted uppercase truncate max-w-[200px]">{branch.location || 'Sin ubicación'}</p>
                            </div>
                            <button 
                              type="button"
                              onClick={() => handleDeleteBranch(branch.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-all md:opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        
                        <div className="p-4 bg-primary/5 border border-dashed border-primary/30 rounded-2xl space-y-3">
                           <div className="flex gap-2">
                             <input 
                               placeholder="Nombre Sucursal"
                               className="bg-surface-elevated border border-border-subtle rounded-xl px-3 py-2 text-xs font-bold w-full focus:outline-none focus:border-primary placeholder:text-text-muted"
                               value={newBranch.name}
                               onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                             />
                             <input 
                               placeholder="Ubicación"
                               className="bg-surface-elevated border border-border-subtle rounded-xl px-3 py-2 text-xs font-bold w-full focus:outline-none focus:border-primary placeholder:text-text-muted"
                               value={newBranch.location}
                               onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })}
                             />
                           </div>
                             <Button 
                               type="button" 
                               variant="primary" 
                               size="sm" 
                               fullWidth 
                               leftIcon={<Plus size={14} />}
                               onClick={handleAddBranch}
                               isLoading={loading}
                             >
                             Agregar Sucursal
                           </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-8">
                    <Button type="submit" fullWidth size="lg" isLoading={loading}>
                      {editingTenant ? 'Actualizar Información' : 'Crear Registro de Cliente'}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GLOBAL LOADING OVERLAY */}
      {loading && tenants.length === 0 && (
        <div className="fixed inset-0 bg-surface-base/50 backdrop-blur-sm flex items-center justify-center z-[200]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
