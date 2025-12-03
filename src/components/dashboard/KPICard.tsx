import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'danger' | 'warning' | 'success';
}

export function KPICard({ title, value, icon: Icon, trend, variant = 'default' }: KPICardProps) {
  const variantStyles = {
    default: 'card-accent-primary',
    danger: 'card-accent-danger',
    warning: 'card-accent-warning',
    success: 'card-accent-success',
  };

  return (
    <div className={cn(
      'bg-card rounded-lg p-6 shadow-card hover:shadow-card-hover transition-all duration-200',
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-card-foreground mt-2">{value}</p>
          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-sm font-medium',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-accent rounded-lg">
          <Icon className="h-6 w-6 text-secondary" />
        </div>
      </div>
    </div>
  );
}
