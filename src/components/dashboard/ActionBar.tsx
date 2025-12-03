import { Plus, ClipboardList, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ActionBar() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md">
        <Plus className="mr-2 h-4 w-4" />
        Add Vendor
      </Button>
      <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md">
        <ClipboardList className="mr-2 h-4 w-4" />
        Create Assessment
      </Button>
      <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md">
        <Upload className="mr-2 h-4 w-4" />
        Upload Document
      </Button>
    </div>
  );
}
