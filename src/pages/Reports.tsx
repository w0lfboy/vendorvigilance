import { useState } from 'react';
import { 
  FileBarChart, 
  Download, 
  Calendar, 
  Building2, 
  Shield, 
  CheckCircle2,
  Clock,
  Plus,
  FileText,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
}

interface GeneratedReport {
  id: string;
  name: string;
  template: string;
  generatedAt: Date;
  status: 'completed' | 'generating' | 'failed';
  fileSize?: string;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: '1',
    name: 'Executive Summary',
    description: 'High-level overview of vendor risk posture, key metrics, and trends',
    icon: TrendingUp,
    category: 'Executive',
  },
  {
    id: '2',
    name: 'Vendor Risk Assessment',
    description: 'Detailed risk analysis for individual vendors or portfolio',
    icon: Shield,
    category: 'Risk',
  },
  {
    id: '3',
    name: 'Compliance Status',
    description: 'Framework compliance status across all vendors',
    icon: CheckCircle2,
    category: 'Compliance',
  },
  {
    id: '4',
    name: 'Assessment Results',
    description: 'Summary of completed questionnaire assessments',
    icon: FileText,
    category: 'Assessment',
  },
  {
    id: '5',
    name: 'Issue Tracker',
    description: 'Open issues, remediation status, and aging report',
    icon: Clock,
    category: 'Operations',
  },
  {
    id: '6',
    name: 'Vendor Portfolio',
    description: 'Complete vendor inventory with risk tiers and contract details',
    icon: Building2,
    category: 'Inventory',
  },
];

const mockReportHistory: GeneratedReport[] = [
  { id: 'r1', name: 'Q4 Executive Summary', template: 'Executive Summary', generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), status: 'completed', fileSize: '2.4 MB' },
  { id: 'r2', name: 'Annual Compliance Report', template: 'Compliance Status', generatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), status: 'completed', fileSize: '4.1 MB' },
  { id: 'r3', name: 'November Assessment Results', template: 'Assessment Results', generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), status: 'completed', fileSize: '1.8 MB' },
  { id: 'r4', name: 'Critical Vendor Risk Report', template: 'Vendor Risk Assessment', generatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), status: 'completed', fileSize: '3.2 MB' },
];

export default function Reports() {
  const { toast } = useToast();
  const [reportHistory, setReportHistory] = useState<GeneratedReport[]>(mockReportHistory);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [reportName, setReportName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleGenerateReport = async () => {
    if (!selectedTemplate || !reportName) {
      toast({ title: 'Error', description: 'Please select a template and enter a report name', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);

    // Simulate report generation
    const newReport: GeneratedReport = {
      id: `r${Date.now()}`,
      name: reportName,
      template: reportTemplates.find(t => t.id === selectedTemplate)?.name || '',
      generatedAt: new Date(),
      status: 'generating',
    };

    setReportHistory(prev => [newReport, ...prev]);
    setDialogOpen(false);

    // Simulate async generation
    setTimeout(() => {
      setReportHistory(prev => prev.map(r => 
        r.id === newReport.id 
          ? { ...r, status: 'completed' as const, fileSize: '2.1 MB' }
          : r
      ));
      setIsGenerating(false);
      toast({ title: 'Report Generated', description: `${reportName} is ready for download` });
    }, 3000);

    setReportName('');
    setSelectedTemplate('');
  };

  const handleDownload = (report: GeneratedReport) => {
    toast({ title: 'Download Started', description: `Downloading ${report.name}...` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Generate and download risk management reports</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New Report</DialogTitle>
              <DialogDescription>
                Select a template and customize your report
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="template">Report Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Report Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Q4 2024 Executive Summary"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="flex gap-2">
                  <Input type="date" className="flex-1" />
                  <Input type="date" className="flex-1" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleGenerateReport} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Template Gallery */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTemplates.map(template => (
            <Card 
              key={template.id} 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => {
                setSelectedTemplate(template.id);
                setDialogOpen(true);
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <template.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {template.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{template.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Generated Reports</CardTitle>
          <CardDescription>Recent reports available for download</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportHistory.map(report => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileBarChart className="h-4 w-4 text-muted-foreground" />
                      {report.name}
                    </div>
                  </TableCell>
                  <TableCell>{report.template}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {report.generatedAt.toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      report.status === 'completed' ? 'default' :
                      report.status === 'generating' ? 'secondary' : 'destructive'
                    }>
                      {report.status === 'generating' && (
                        <span className="mr-1 animate-spin">⏳</span>
                      )}
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{report.fileSize || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={report.status !== 'completed'}
                      onClick={() => handleDownload(report)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
