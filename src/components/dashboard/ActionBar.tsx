import { useNavigate } from 'react-router-dom';
import { Plus, ClipboardList, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ActionBar() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap gap-3">
      <Button 
        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md"
        onClick={() => navigate('/vendors')}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Vendor
      </Button>
      <Button 
        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md"
        onClick={() => navigate('/assessments')}
      >
        <ClipboardList className="mr-2 h-4 w-4" />
        Create Assessment
      </Button>
      <Button 
        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md"
        onClick={() => navigate('/documents')}
      >
        <Upload className="mr-2 h-4 w-4" />
        Upload Document
      </Button>
    </div>
  );
}
