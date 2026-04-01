import React, { useState, useEffect, useMemo } from 'react';
import { Clock, CheckCircle, Zap, ChefHat } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { Order } from '../../../types/domain';
import { ANIMATIONS } from '../../../lib/motion';

// --- CUSTOM HOOK FOR INDEPENDENT TIMER ---
const useOrderTimer = (createdAt: string) => {
  const [elapsed, setElapsed] = useState({ min: 0, sec: 0, totalSec: 0 });

  useEffect(() => {
    const start = new Date(createdAt).getTime();
    
    const update = () => {
      const diff = Math.max(0, Date.now() - start);
      const totalSec = Math.floor(diff / 1000);
      const min = Math.floor(totalSec / 60);
      const sec = totalSec % 60;
      setElapsed({ min, sec, totalSec });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return elapsed;
};

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, currentStatus: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = React.memo(({ order, onStatusChange }) => {
  const { min, sec, totalSec } = useOrderTimer(order.created_at);
  
  // Semaphore Logic
  const isNew = totalSec < 60; // < 1 min
  const isWarning = min >= 5 && min < 10;
  const isUrgent = min >= 10;

  const statusStyles = useMemo(() => {
    if (isUrgent) return {
      border: 'border-danger/50 shadow-danger/20',
      timeText: 'text-danger animate-pulse',
      bgPulse: 'bg-danger/5'
    };
    if (isWarning) return {
      border: 'border-warning/50 shadow-warning/10',
      timeText: 'text-warning',
      bgPulse: 'bg-transparent'
    };
    return {
      border: 'border-white/5',
      timeText: order.status === 'PREPARING' ? 'text-primary' : 'text-text-muted',
      bgPulse: 'bg-transparent'
    };
  }, [isUrgent, isWarning, order.status]);

  return (
    <motion.div
      layout
      {...ANIMATIONS.fadeInUp}
      exit={{ opacity: 0, scale: 0.9 }}
      className="h-full"
    >
      <Card
        variant="solid"
        padding="none"
        className={cn(
          "h-full flex flex-col transition-all duration-500 overflow-hidden",
          statusStyles.border,
          statusStyles.bgPulse
        )}
      >
        {/* HEADER: ORDER # & TIMER */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-text-primary tracking-tighter uppercase leading-none">
                #{(order.id || '').substring(0, 4)}
              </span>
              {isNew && (
                <Badge variant="warning" size="md" className="animate-bounce">NUEVO</Badge>
              )}
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-[0.2em] leading-none",
              order.status === 'PREPARING' ? "text-primary" : "text-text-muted"
            )}>
              {order.status === 'PREPARING' ? 'EN FUEGO' : 'PENDIENTE'}
            </span>
            {order.customer_name && (
              <span className="mt-2 text-base font-black text-white bg-primary/20 px-3 py-1.5 rounded-xl border border-primary/30 w-fit shadow-lg block">
                👤 {order.customer_name}
              </span>
            )}
          </div>

          <div className={cn(
            "flex items-center gap-2 font-black text-2xl tracking-tighter tabular-nums",
            statusStyles.timeText
          )}>
            <Clock size={24} />
            <span>{min}m {sec.toString().padStart(2, '0')}s</span>
          </div>
        </div>

        {/* BODY: ITEMS LIST */}
        <div className="p-6 flex-1 space-y-6 overflow-y-auto">
          {order.order_items?.map((item: any, idx: number) => (
            <div key={item.id || idx} className="flex items-start gap-4">
              <div className="w-12 h-12 bg-surface-base rounded-2xl flex items-center justify-center border border-white/5 font-black text-2xl text-primary shrink-0 shadow-inner">
                {item.quantity}
              </div>
              <div className="flex-1 pt-1">
                <p className="font-black text-xl text-text-primary leading-tight uppercase tracking-tight">
                  {item.products?.name}
                </p>
                
                {/* HIGHLIGHTED MODIFICATIONS FOR KITCHEN */}
                {(item.modifiers?.length > 0 || item.notes) ? (
                  <div className="mt-2 flex flex-col gap-1.5">
                    {item.modifiers?.map((mod: any, mIdx: number) => {
                      const label = typeof mod === 'string' ? mod : mod.label;
                      const isAdd = label.startsWith('+');
                      return (
                        <span key={mIdx} className={`text-sm font-black uppercase tracking-widest px-2 py-1 rounded-md border ${isAdd ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-danger/20 border-danger/50 text-danger'}`}>
                          {label}
                        </span>
                      );
                    })}
                    {item.notes && (
                      <span className="text-sm font-black text-warning uppercase tracking-widest px-2 py-1 flex items-center gap-1 rounded-md bg-warning/10 border border-warning/30">
                        <Zap size={14} className="fill-warning" /> OBS: {item.notes}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2 mt-1">
                    <Badge variant="neutral" size="sm">REGULAR</Badge>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER: ACTION BUTTON */}
        <div className="p-6 bg-white/[0.03] border-t border-white/5">
          <Button
            size="lg"
            fullWidth
            variant={order.status === 'PENDING' ? 'primary' : 'success'}
            className="h-20 text-xl font-black shadow-2xl"
            onClick={() => onStatusChange(order.id, order.status)}
            leftIcon={order.status === 'PREPARING' ? <CheckCircle size={24} /> : <ChefHat size={24} />}
          >
            {order.status === 'PENDING' ? 'EMPEZAR' : 'LISTO'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
});

OrderCard.displayName = 'OrderCard';

export default OrderCard;
