import { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ListTodo,
  Calendar,
  Building2,
  ArrowLeft,
  Filter,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useIssues } from '@/hooks/useIssues';
import { useVendors } from '@/hooks/useVendors';
import { format, isPast, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

const severityConfig = {
  critical: { label: 'Critical', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500' },
  high: { label: 'High', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500' },
  medium: { label: 'Medium', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500' },
  low: { label: 'Low', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500' },
};

const statusConfig = {
  open: { label: 'Open', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  in_progress: { label: 'In Progress', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  resolved: { label: 'Resolved', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  closed: { label: 'Closed', color: 'text-muted-foreground', bg: 'bg-muted' },
};

export default function RemediationTracking() {
  const navigate = useNavigate();
  const { issues, updateIssue } = useIssues();
  const { vendors } = useVendors();
  
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vendorFilter, setVendorFilter] = useState<string>('all');
  const [selectedIssue, setSelectedIssue] = useState<typeof issues[0] | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Filter issues
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesSeverity = severityFilter === 'all' || issue.severity === severityFilter;
      const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
      const matchesVendor = vendorFilter === 'all' || issue.vendor_id === vendorFilter;
      return matchesSeverity && matchesStatus && matchesVendor;
    });
  }, [issues, severityFilter, statusFilter, vendorFilter]);

  // Group issues by status
  const issuesByStatus = useMemo(() => ({
    open: filteredIssues.filter(i => i.status === 'open'),
    in_progress: filteredIssues.filter(i => i.status === 'in_progress'),
    resolved: filteredIssues.filter(i => i.status === 'resolved' || i.status === 'closed'),
  }), [filteredIssues]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = issues.length;
    const open = issues.filter(i => i.status === 'open').length;
    const inProgress = issues.filter(i => i.status === 'in_progress').length;
    const resolved = issues.filter(i => i.status === 'resolved' || i.status === 'closed').length;
    const overdue = issues.filter(i => 
      i.due_date && isPast(new Date(i.due_date)) && i.status !== 'resolved' && i.status !== 'closed'
    ).length;
    const critical = issues.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
    
    return {
      total,
      open,
      inProgress,
      resolved,
      overdue,
      critical,
      completionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
    };
  }, [issues]);

  const getVendorName = (vendorId: string) => 
    vendors.find(v => v.id === vendorId)?.name || 'Unknown Vendor';

  const handleStatusChange = async (issueId: string, newStatus: 'open' | 'in_progress' | 'resolved' | 'closed') => {
    await updateIssue.mutateAsync({
      id: issueId,
      status: newStatus,
      resolved_date: newStatus === 'resolved' ? new Date().toISOString() : null,
    });
  };

  const handleResolve = async () => {
    if (!selectedIssue) return;
    
    await updateIssue.mutateAsync({
      id: selectedIssue.id,
      status: 'resolved' as const,
      resolution_notes: resolutionNotes,
      resolved_date: new Date().toISOString(),
    });
    
    setSelectedIssue(null);
    setResolutionNotes('');
  };

  const IssueCard = ({ issue }: { issue: typeof issues[0] }) => {
    const severity = severityConfig[issue.severity as keyof typeof severityConfig] || severityConfig.medium;
    const status = statusConfig[issue.status as keyof typeof statusConfig] || statusConfig.open;
    const isOverdue = issue.due_date && isPast(new Date(issue.due_date)) && issue.status !== 'resolved';
    const daysUntilDue = issue.due_date ? differenceInDays(new Date(issue.due_date), new Date()) : null;

    return (
      <Card 
        className={cn(
          "hover:shadow-card-hover transition-all cursor-pointer",
          isOverdue && "border-destructive/50"
        )}
        onClick={() => setSelectedIssue(issue)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className={cn(severity.bg, severity.color, 'border-0')}>
                  {severity.label}
                </Badge>
                <Badge className={cn(status.bg, status.color, 'border-0')}>
                  {status.label}
                </Badge>
                {isOverdue && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Overdue
                  </Badge>
                )}
              </div>
              <h3 className="font-medium text-foreground truncate">{issue.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{issue.description}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {getVendorName(issue.vendor_id)}
                </span>
                {issue.due_date && (
                  <span className={cn(
                    "flex items-center gap-1",
                    isOverdue && "text-destructive"
                  )}>
                    <Calendar className="h-3 w-3" />
                    {format(new Date(issue.due_date), 'MMM d, yyyy')}
                    {daysUntilDue !== null && !isOverdue && daysUntilDue <= 7 && (
                      <span className="text-warning">({daysUntilDue} days left)</span>
                    )}
                  </span>
                )}
              </div>
            </div>
            <Select 
              value={issue.status} 
              onValueChange={(v: 'open' | 'in_progress' | 'resolved' | 'closed') => {
                if (v === 'resolved') {
                  setSelectedIssue(issue);
                } else {
                  handleStatusChange(issue.id, v);
                }
              }}
            >
              <SelectTrigger className="w-[130px]" onClick={e => e.stopPropagation()}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ListTodo className="h-6 w-6 text-primary" />
              Remediation Tracking
            </h1>
            <p className="text-muted-foreground">Track and resolve issues from AI analysis</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/analytics')}
        >
          View Analytics
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Total Issues</p>
            <p className="text-2xl font-bold">{metrics.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Open</p>
            <p className="text-2xl font-bold text-amber-500">{metrics.open}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold text-blue-500">{metrics.inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Resolved</p>
            <p className="text-2xl font-bold text-emerald-500">{metrics.resolved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Overdue</p>
            <p className="text-2xl font-bold text-destructive">{metrics.overdue}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Completion</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{metrics.completionRate}%</p>
              <Progress value={metrics.completionRate} className="flex-1 h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Select value={vendorFilter} onValueChange={setVendorFilter}>
          <SelectTrigger className="w-[180px]">
            <Building2 className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Vendor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vendors</SelectItem>
            {vendors.map(v => (
              <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Issues Kanban View */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban View</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="space-y-3">
            {filteredIssues.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-success mb-4" />
                  <p className="text-muted-foreground">No issues found</p>
                  <p className="text-sm text-muted-foreground">Issues from AI analysis will appear here automatically</p>
                </CardContent>
              </Card>
            ) : (
              filteredIssues.map(issue => <IssueCard key={issue.id} issue={issue} />)
            )}
          </div>
        </TabsContent>

        <TabsContent value="kanban">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Open Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  Open
                  <Badge variant="secondary">{issuesByStatus.open.length}</Badge>
                </h3>
              </div>
              <div className="space-y-3 min-h-[200px] p-3 bg-muted/30 rounded-lg">
                {issuesByStatus.open.map(issue => <IssueCard key={issue.id} issue={issue} />)}
              </div>
            </div>

            {/* In Progress Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-500" />
                  In Progress
                  <Badge variant="secondary">{issuesByStatus.in_progress.length}</Badge>
                </h3>
              </div>
              <div className="space-y-3 min-h-[200px] p-3 bg-muted/30 rounded-lg">
                {issuesByStatus.in_progress.map(issue => <IssueCard key={issue.id} issue={issue} />)}
              </div>
            </div>

            {/* Resolved Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Resolved
                  <Badge variant="secondary">{issuesByStatus.resolved.length}</Badge>
                </h3>
              </div>
              <div className="space-y-3 min-h-[200px] p-3 bg-muted/30 rounded-lg">
                {issuesByStatus.resolved.map(issue => <IssueCard key={issue.id} issue={issue} />)}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Resolution Dialog */}
      <Dialog open={!!selectedIssue} onOpenChange={(open) => !open && setSelectedIssue(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Resolve Issue</DialogTitle>
            <DialogDescription>
              {selectedIssue?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">{selectedIssue?.description}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span>Vendor: {selectedIssue && getVendorName(selectedIssue.vendor_id)}</span>
                <span>Severity: {selectedIssue?.severity}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Resolution Notes</Label>
              <Textarea
                placeholder="Describe how this issue was resolved..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedIssue(null)}>Cancel</Button>
              <Button 
                onClick={handleResolve}
                disabled={updateIssue.isPending}
                className="bg-success hover:bg-success/90"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Resolved
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
