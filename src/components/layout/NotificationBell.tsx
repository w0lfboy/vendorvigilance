import { Bell, X, AlertTriangle, AlertCircle, Info, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const typeConfig = {
  critical: {
    icon: AlertTriangle,
    className: 'text-destructive',
    bgClassName: 'bg-destructive/10',
  },
  warning: {
    icon: AlertCircle,
    className: 'text-warning',
    bgClassName: 'bg-warning/10',
  },
  info: {
    icon: Info,
    className: 'text-primary',
    bgClassName: 'bg-primary/10',
  },
};

export function NotificationBell() {
  const { notifications, unreadCount, dismissNotification, dismissAll, isLoading } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-header-foreground hover:bg-sidebar-accent h-9 w-9 md:h-10 md:w-10"
        >
          <Bell className="h-4 w-4 md:h-5 md:w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-[10px] md:text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 md:w-96 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7"
              onClick={() => dismissAll()}
            >
              <Check className="h-3 w-3 mr-1" />
              Dismiss all
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[320px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <Bell className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground/70">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const config = typeConfig[notification.type as keyof typeof typeConfig] || typeConfig.info;
                const Icon = config.icon;

                return (
                  <div 
                    key={notification.id}
                    className="px-4 py-3 hover:bg-accent/50 transition-colors relative group"
                  >
                    <div className="flex gap-3">
                      <div className={cn('p-2 rounded-full shrink-0', config.bgClassName)}>
                        <Icon className={cn('h-4 w-4', config.className)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{notification.title}</p>
                        {notification.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notification.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {notification.vendor?.name && (
                            <Badge variant="outline" className="text-xs">
                              {notification.vendor.name}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={() => dismissNotification(notification.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
