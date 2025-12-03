import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HeatMapCell {
  impact: number;
  likelihood: number;
  vendors: string[];
}

interface RiskHeatMapProps {
  data: HeatMapCell[];
}

export function RiskHeatMap({ data }: RiskHeatMapProps) {
  const getColorClass = (impact: number, likelihood: number) => {
    const riskLevel = impact * likelihood;
    if (riskLevel >= 20) return 'bg-destructive hover:bg-destructive/80';
    if (riskLevel >= 12) return 'bg-warning hover:bg-warning/80';
    if (riskLevel >= 6) return 'bg-info hover:bg-info/80';
    return 'bg-success hover:bg-success/80';
  };

  const getCell = (impact: number, likelihood: number) => {
    return data.find(d => d.impact === impact && d.likelihood === likelihood);
  };

  return (
    <div className="bg-card rounded-lg shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-card-foreground">Risk Heat Map</h3>
        <button className="text-sm text-secondary hover:text-secondary/80 font-medium">
          Expand ↗
        </button>
      </div>
      
      <div className="flex gap-4">
        <div className="flex flex-col justify-between py-2 text-xs text-muted-foreground">
          <span>5</span>
          <span>4</span>
          <span>3</span>
          <span>2</span>
          <span>1</span>
        </div>
        
        <div className="flex-1">
          <div className="grid grid-cols-5 gap-1">
            {[5, 4, 3, 2, 1].map((impact) =>
              [1, 2, 3, 4, 5].map((likelihood) => {
                const cell = getCell(impact, likelihood);
                return (
                  <Tooltip key={`${impact}-${likelihood}`}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'aspect-square rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center',
                          cell ? getColorClass(impact, likelihood) : 'bg-muted'
                        )}
                      >
                        {cell && cell.vendors.length > 0 && (
                          <span className="text-xs font-bold text-white">
                            {cell.vendors.length}
                          </span>
                        )}
                      </div>
                    </TooltipTrigger>
                    {cell && cell.vendors.length > 0 && (
                      <TooltipContent>
                        <div className="text-sm">
                          <p className="font-medium mb-1">
                            Impact: {impact}, Likelihood: {likelihood}
                          </p>
                          <ul className="text-xs">
                            {cell.vendors.map((vendor) => (
                              <li key={vendor}>{vendor}</li>
                            ))}
                          </ul>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })
            )}
          </div>
          <div className="flex justify-between mt-2 px-2 text-xs text-muted-foreground">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-1">Likelihood →</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-success" />
          <span className="text-muted-foreground">Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-info" />
          <span className="text-muted-foreground">Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-warning" />
          <span className="text-muted-foreground">High</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-destructive" />
          <span className="text-muted-foreground">Critical</span>
        </div>
      </div>
    </div>
  );
}
