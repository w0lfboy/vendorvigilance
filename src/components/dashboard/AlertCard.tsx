import { useNavigate } from 'react-router-dom';
import { AlertTriangle, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Alert } from '@/data/mockData';
import { vendors } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';

interface AlertCardProps {
  alert: Alert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const navigate = useNavigate();
  
  const icons = {
    critical: AlertTriangle,
    warning: AlertCircle,
    info: Info,
  };

  const styles = {
    critical: 'bg-destructive/10 border-destructive/30 text-destructive',
    warning: 'bg-warning/10 border-warning/30 text-warning',
    info: 'bg-info/10 border-info/30 text-info',
  };

  const Icon = icons[alert.type];

  // Find vendor ID by name
  const vendor = vendors.find(v => v.name === alert.vendorName);

  const handleClick = () => {
    if (vendor) {
      navigate(`/vendors/${vendor.id}`);
    } else {
      navigate('/vendors');
    }
  };

  return (
    <div 
      className={cn(
        'rounded-lg border p-4 transition-all duration-200 hover:shadow-md cursor-pointer',
        styles[alert.type]
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'p-2 rounded-full',
          alert.type === 'critical' && 'bg-destructive/20',
          alert.type === 'warning' && 'bg-warning/20',
          alert.type === 'info' && 'bg-info/20'
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-foreground">{alert.title}</h4>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
          <p className="text-sm font-medium text-foreground mt-1">{alert.vendorName}</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
