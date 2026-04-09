import React from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Users as UsersIcon, UserPlus } from 'lucide-react';
import Button from '../../components/ui/Button';

const UsersPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
           <Badge variant="primary" size="sm">Gestión de Accesos</Badge>
           <h1 className="text-4xl font-black uppercase tracking-tight text-text-primary mt-2">Usuarios</h1>
        </div>
        <Button leftIcon={<UserPlus size={20} />}>Nuevo Usuario</Button>
      </header>
      
      <Card className="p-12 border-dashed border-border-subtle flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-surface-base rounded-2xl flex items-center justify-center text-text-muted mb-4">
          <UsersIcon size={32} />
        </div>
        <h3 className="text-xl font-bold text-text-primary uppercase">No hay usuarios adicionales</h3>
        <p className="text-text-secondary mt-2">Próximamente podrás gestionar perfiles secundarios desde aquí.</p>
      </Card>
    </div>
  );
};

export default UsersPage;
