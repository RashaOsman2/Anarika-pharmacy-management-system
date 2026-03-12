import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  variant?: 'blue' | 'teal' | 'green' | 'orange';
}

export default function StatCard({ title, value, icon, variant = 'blue' }: StatCardProps) {
  const variants = {
    blue: 'bg-pharmacy-blue-light',
    teal: 'bg-pharmacy-teal-light',
    green: 'bg-pharmacy-green-light',
    orange: 'bg-pharmacy-orange-light',
  };

  const iconColors = {
    blue: 'text-pharmacy-blue',
    teal: 'text-pharmacy-teal',
    green: 'text-pharmacy-green',
    orange: 'text-pharmacy-orange',
  };

  return (
    <div className={cn('stat-card bg-card', variants[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-display font-bold">{value}</p>
        </div>
        <div className={cn('p-3 rounded-xl bg-card', iconColors[variant])}>
          {icon}
        </div>
      </div>
    </div>
  );
}