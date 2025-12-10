import { useState } from 'react';
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Eye,
  Sparkles,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useAssessments, useTemplates, type VendorAssessment } from '@/hooks/useAssessments';
import { useVendors } from '@/hooks/useVendors';
import { format, addDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { AssessmentDetailsDialog } from '@/components/assessments/AssessmentDetailsDialog';

const statusConfig: Record<string, { label: string; icon: any; class: string }> = {
  pending: { label: 'Pending', icon: Clock, class: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'In Progress', icon: FileText, class: 'bg-info/10 text-info' },
  submitted: { label: 'Submitted', icon: Send, class: 'bg-warning/10 text-warning' },
  under_review: { label: 'Under Review', icon: Eye, class: 'bg-secondary/10 text-secondary' },
  completed: { label: 'Completed', icon: CheckCircle2, class: 'bg-success/10 text-success' },
};

export default function Assessments() {
  const { assessments, isLoading, createAssessment } = useAssessments();
  const { templates } = useTemplates();
  const { vendors } = useVendors();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<VendorAssessment | null>(null);
  const [createData, setCreateData] = useState({
    vendorId: '',
    templateId: '',
    title: '',
    dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    isRecurring: false,
    recurrenceInterval: 'quarterly',
  });

  const filteredAssessments = assessments.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getVendorName = (vendorId: string) => {
    return vendors.find(v => v.id === vendorId)?.name || 'Unknown Vendor';
  };

  const handleCreate = async () => {
    if (!createData.vendorId || !createData.title || !createData.dueDate) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    await createAssessment.mutateAsync({
      vendor_id: createData.vendorId,
      title: createData.title,
      due_date: new Date(createData.dueDate).toISOString(),
      template_id: createData.templateId || null,
      is_recurring: createData.isRecurring,
      recurrence_interval: createData.isRecurring ? createData.recurrenceInterval : null,
    });

    setIsCreateOpen(false);
    setCreateData({
      vendorId: '',
      templateId: '',
      title: '',
      dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      isRecurring: false,
      recurrenceInterval: 'quarterly',
    });
  };

  const getProgressPercentage = (status: string) => {
    const progressMap: Record<string, number> = {
      pending: 0,
      in_progress: 40,
      submitted: 70,
      under_review: 85,
      completed: 100,
    };
    return progressMap[status] || 0;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assessments</h1>
          <p className="text-muted-foreground">Manage vendor questionnaires and risk assessments</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Create Assessment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Assessment</DialogTitle>
              <DialogDescription>Send a questionnaire to a vendor for risk evaluation</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Vendor *</Label>
                <Select value={createData.vendorId} onValueChange={(v) => setCreateData(prev => ({ ...prev, vendorId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Assessment Title *</Label>
                <Input 
                  value={createData.title}
                  onChange={(e) => setCreateData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Annual Security Assessment 2024"
                />
              </div>

              <div className="space-y-2">
                <Label>Questionnaire Template</Label>
                <Select value={createData.templateId} onValueChange={(v) => setCreateData(prev => ({ ...prev, templateId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Custom Assessment</SelectItem>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Due Date *</Label>
                <Input 
                  type="date"
                  value={createData.dueDate}
                  onChange={(e) => setCreateData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="recurring"
                  checked={createData.isRecurring}
                  onCheckedChange={(checked) => setCreateData(prev => ({ ...prev, isRecurring: !!checked }))}
                />
                <Label htmlFor="recurring" className="cursor-pointer">Make this a recurring assessment</Label>
              </div>

              {createData.isRecurring && (
                <div className="space-y-2 pl-6">
                  <Label>Recurrence Interval</Label>
                  <Select value={createData.recurrenceInterval} onValueChange={(v) => setCreateData(prev => ({ ...prev, recurrenceInterval: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button 
                className="w-full bg-secondary hover:bg-secondary/90"
                onClick={handleCreate}
                disabled={createAssessment.isPending}
              >
                {createAssessment.isPending ? 'Creating...' : 'Create & Send Assessment'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-card-foreground">{assessments.length}</p>
        </div>
        <div className="bg-card rounded-lg p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-warning">{assessments.filter(a => a.status === 'pending').length}</p>
        </div>
        <div className="bg-card rounded-lg p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Submitted</p>
          <p className="text-2xl font-bold text-info">{assessments.filter(a => a.status === 'submitted').length}</p>
        </div>
        <div className="bg-card rounded-lg p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-success">{assessments.filter(a => a.status === 'completed').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assessments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assessment Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-card rounded-lg p-8 text-center shadow-card">
            <p className="text-muted-foreground">Loading assessments...</p>
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="bg-card rounded-lg p-8 text-center shadow-card">
            <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No assessments found</p>
            <p className="text-sm text-muted-foreground">Create your first assessment to start evaluating vendors</p>
          </div>
        ) : (
          filteredAssessments.map((assessment) => {
            const status = statusConfig[assessment.status];
            const StatusIcon = status.icon;
            const progress = getProgressPercentage(assessment.status);
            const isOverdue = new Date(assessment.due_date) < new Date() && assessment.status !== 'completed';
            const hasScore = assessment.score !== null;
            
            return (
              <div 
                key={assessment.id} 
                className="bg-card rounded-lg shadow-card p-5 hover:shadow-card-hover transition-all cursor-pointer"
                onClick={() => setSelectedAssessment(assessment)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-card-foreground">{assessment.title}</h3>
                      <Badge className={cn('gap-1', status.class)}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                      {isOverdue && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Overdue
                        </Badge>
                      )}
                      {hasScore && (
                        <Badge variant="outline" className="gap-1">
                          <Sparkles className="h-3 w-3" />
                          Score: {assessment.score}%
                        </Badge>
                      )}
                      {assessment.is_recurring && (
                        <Badge variant="outline" className="text-xs">
                          Recurring ({assessment.recurrence_interval})
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Vendor: <span className="text-foreground font-medium">{getVendorName(assessment.vendor_id)}</span>
                      {' • '}
                      Due: {format(new Date(assessment.due_date), 'MMM d, yyyy')}
                      {assessment.risk_level && (
                        <>
                          {' • '}
                          Risk: <span className={cn(
                            'font-medium capitalize',
                            assessment.risk_level === 'low' && 'text-success',
                            assessment.risk_level === 'medium' && 'text-warning',
                            assessment.risk_level === 'high' && 'text-orange-500',
                            assessment.risk_level === 'critical' && 'text-destructive',
                          )}>{assessment.risk_level}</span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <Button variant="outline" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAssessment(assessment);
                    }}>
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Assessment Details Dialog */}
      {selectedAssessment && (
        <AssessmentDetailsDialog
          assessment={selectedAssessment}
          vendorName={getVendorName(selectedAssessment.vendor_id)}
          open={!!selectedAssessment}
          onOpenChange={(open) => !open && setSelectedAssessment(null)}
        />
      )}
    </div>
  );
}
