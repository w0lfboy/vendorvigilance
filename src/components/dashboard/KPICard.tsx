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
      'bg-card rounded-lg p-4 md:p-6 shadow-card hover:shadow-card-hover transition-all duration-200',
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-card-foreground mt-1 md:mt-2">{value}</p>
          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-1 md:mt-2 text-xs md:text-sm font-medium',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
              ) : (
                <TrendingDown className="h-3 w-3 md:h-4 md:w-4" />
              )}
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground hidden sm:inline">vs last month</span>
            </div>
          )}
        </div>
        <div className="p-2 md:p-3 bg-accent rounded-lg flex-shrink-0">
          <Icon className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
        </div>
      </div>
    </div>
  );
}
