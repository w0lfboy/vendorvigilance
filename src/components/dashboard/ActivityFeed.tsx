import { 
  CheckCircle2, 
  FileUp, 
  UserPlus, 
  AlertTriangle, 
  FileWarning,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Activity } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const typeConfig = {
    assessment_completed: { icon: CheckCircle2, color: 'text-success bg-success/10' },
    document_uploaded: { icon: FileUp, color: 'text-info bg-info/10' },
    vendor_added: { icon: UserPlus, color: 'text-secondary bg-secondary/10' },
    risk_changed: { icon: AlertTriangle, color: 'text-warning bg-warning/10' },
    issue_created: { icon: FileWarning, color: 'text-destructive bg-destructive/10' },
  };

  return (
    <div className="bg-card rounded-lg shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-card-foreground">Recent Activity</h3>
        <button className="text-sm text-secondary hover:text-secondary/80 font-medium">
          View All →
        </button>
      </div>
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const config = typeConfig[activity.type];
            const Icon = config.icon;
            
            return (
              <div
                key={activity.id}
                className="relative flex gap-4 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={cn(
                  'relative z-10 flex items-center justify-center w-10 h-10 rounded-full shrink-0',
                  config.color
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-card-foreground">{activity.title}</p>
                    {activity.vendorName && (
                      <span className="text-xs px-2 py-0.5 bg-accent rounded-full text-accent-foreground">
                        {activity.vendorName}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.user.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
