import React from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Settings as SettingsIcon } from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <header>
         <Badge variant="primary" size="sm">Configuración de Sistema</Badge>
         <h1 className="text-4xl font-black uppercase tracking-tight text-text-primary mt-2">Ajustes</h1>
      </header>
      
      <Card className="p-12 border-dashed border-border-subtle flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-surface-base rounded-2xl flex items-center justify-center text-text-muted mb-4">
          <SettingsIcon size={32} />
        </div>
        <h3 className="text-xl font-bold text-text-primary uppercase">Módulo en Desarrollo</h3>
        <p className="text-text-secondary mt-2">Aquí podrás configurar parámetros globales de la plataforma próximamente.</p>
      </Card>
    </div>
  );
};

export default SettingsPage;
