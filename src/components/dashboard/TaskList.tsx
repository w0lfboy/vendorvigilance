import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Task } from '@/data/mockData';
import { format } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  const priorityStyles = {
    high: 'bg-destructive/10 text-destructive border-destructive/30',
    medium: 'bg-warning/10 text-warning border-warning/30',
    low: 'bg-info/10 text-info border-info/30',
  };

  return (
    <div className="bg-card rounded-lg shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-card-foreground">Quick Tasks</h3>
        <button className="text-sm text-secondary hover:text-secondary/80 font-medium">
          View All →
        </button>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border bg-background/50 transition-all duration-200 hover:bg-background',
              task.completed && 'opacity-60'
            )}
          >
            <Checkbox
              checked={task.completed}
              className="border-muted-foreground data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
            />
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-medium text-card-foreground',
                task.completed && 'line-through'
              )}>
                {task.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{task.assignee}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  Due {format(task.dueDate, 'MMM d')}
                </span>
              </div>
            </div>
            <Badge variant="outline" className={cn('text-xs', priorityStyles[task.priority])}>
              {task.priority}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
