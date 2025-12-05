import { useNavigate } from 'react-router-dom';
import { Plus, ClipboardList, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ActionBar() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
      <Button 
        size="sm"
        variant="outline"
        className="h-8 px-2 sm:px-3 text-xs font-medium border-secondary/30 hover:bg-secondary hover:text-secondary-foreground transition-colors"
        onClick={() => navigate('/vendors')}
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="hidden xs:inline sm:inline">Add Vendor</span>
        <span className="xs:hidden sm:hidden">Add</span>
      </Button>
      <Button 
        size="sm"
        variant="outline"
        className="h-8 px-2 sm:px-3 text-xs font-medium border-secondary/30 hover:bg-secondary hover:text-secondary-foreground transition-colors"
        onClick={() => navigate('/assessments')}
      >
        <ClipboardList className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Assessment</span>
      </Button>
      <Button 
        size="sm"
        variant="outline"
        className="h-8 px-2 sm:px-3 text-xs font-medium border-secondary/30 hover:bg-secondary hover:text-secondary-foreground transition-colors"
        onClick={() => navigate('/documents')}
      >
        <Upload className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Upload</span>
      </Button>
    </div>
  );
}
