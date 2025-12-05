import { useState, useMemo } from 'react';
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
  TrendingUp,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useVendors } from '@/hooks/useVendors';
import { useAssessments } from '@/hooks/useAssessments';
import { useIssues } from '@/hooks/useIssues';
import { useDocuments } from '@/hooks/useDocuments';
import { format } from 'date-fns';

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
  data?: any;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'executive',
    name: 'Executive Summary',
    description: 'High-level overview of vendor risk posture, key metrics, and trends',
    icon: TrendingUp,
    category: 'Executive',
  },
  {
    id: 'risk',
    name: 'Vendor Risk Assessment',
    description: 'Detailed risk analysis for individual vendors or portfolio',
    icon: Shield,
    category: 'Risk',
  },
  {
    id: 'compliance',
    name: 'Compliance Status',
    description: 'Framework compliance status across all vendors',
    icon: CheckCircle2,
    category: 'Compliance',
  },
  {
    id: 'assessment',
    name: 'Assessment Results',
    description: 'Summary of completed questionnaire assessments',
    icon: FileText,
    category: 'Assessment',
  },
  {
    id: 'issues',
    name: 'Issue Tracker',
    description: 'Open issues, remediation status, and aging report',
    icon: Clock,
    category: 'Operations',
  },
  {
    id: 'portfolio',
    name: 'Vendor Portfolio',
    description: 'Complete vendor inventory with risk tiers and contract details',
    icon: Building2,
    category: 'Inventory',
  },
];

export default function Reports() {
  const { toast } = useToast();
  const { vendors } = useVendors();
  const { assessments } = useAssessments();
  const { issues } = useIssues();
  const { documents } = useDocuments();
  
  const [reportHistory, setReportHistory] = useState<GeneratedReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [reportName, setReportName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<GeneratedReport | null>(null);

  // Calculate report data
  const generateReportData = (templateId: string) => {
    switch (templateId) {
      case 'executive':
        return {
          totalVendors: vendors.length,
          criticalRisk: vendors.filter(v => v.risk_tier === 'critical').length,
          highRisk: vendors.filter(v => v.risk_tier === 'high').length,
          mediumRisk: vendors.filter(v => v.risk_tier === 'medium').length,
          lowRisk: vendors.filter(v => v.risk_tier === 'low').length,
          avgRiskScore: vendors.length > 0 ? (vendors.reduce((acc, v) => acc + (v.risk_score || 0), 0) / vendors.length).toFixed(1) : '0',
          totalAnnualValue: vendors.reduce((acc, v) => acc + (v.annual_value || 0), 0),
          pendingAssessments: assessments.filter(a => a.status === 'pending').length,
          openIssues: issues.filter(i => i.status === 'open').length,
          vendors: vendors.slice(0, 10),
        };
      case 'risk':
        return {
          vendors: vendors.map(v => ({
            name: v.name,
            category: v.category,
            riskTier: v.risk_tier,
            riskScore: v.risk_score,
            status: v.status,
            lastAssessment: v.last_assessment,
            openIssues: issues.filter(i => i.vendor_id === v.id && i.status === 'open').length,
          })).sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0)),
          summary: {
            critical: vendors.filter(v => v.risk_tier === 'critical'),
            high: vendors.filter(v => v.risk_tier === 'high'),
          }
        };
      case 'compliance':
        const completedAssessments = assessments.filter(a => a.status === 'completed');
        return {
          totalAssessments: assessments.length,
          completed: completedAssessments.length,
          inProgress: assessments.filter(a => a.status === 'in_progress' || a.status === 'submitted').length,
          pending: assessments.filter(a => a.status === 'pending').length,
          complianceRate: assessments.length > 0 ? Math.round((completedAssessments.length / assessments.length) * 100) : 0,
          vendorsWithCertifications: documents.filter(d => d.type === 'soc2_report' || d.type === 'iso_certificate').length,
          assessments: assessments.slice(0, 15),
        };
      case 'assessment':
        return {
          assessments: assessments.map(a => {
            const vendor = vendors.find(v => v.id === a.vendor_id);
            return {
              ...a,
              vendorName: vendor?.name || 'Unknown',
            };
          }),
          byStatus: {
            pending: assessments.filter(a => a.status === 'pending').length,
            inProgress: assessments.filter(a => a.status === 'in_progress' || a.status === 'submitted').length,
            completed: assessments.filter(a => a.status === 'completed').length,
          },
          avgScore: assessments.filter(a => a.score).reduce((acc, a) => acc + (a.score || 0), 0) / Math.max(1, assessments.filter(a => a.score).length),
        };
      case 'issues':
        return {
          issues: issues.map(i => {
            const vendor = vendors.find(v => v.id === i.vendor_id);
            return {
              ...i,
              vendorName: vendor?.name || 'Unknown',
            };
          }),
          byStatus: {
            open: issues.filter(i => i.status === 'open').length,
            inProgress: issues.filter(i => i.status === 'in_progress').length,
            resolved: issues.filter(i => i.status === 'resolved').length,
          },
          bySeverity: {
            critical: issues.filter(i => i.severity === 'critical').length,
            high: issues.filter(i => i.severity === 'high').length,
            medium: issues.filter(i => i.severity === 'medium').length,
            low: issues.filter(i => i.severity === 'low').length,
          },
        };
      case 'portfolio':
        return {
          vendors: vendors.map(v => ({
            ...v,
            documentsCount: documents.filter(d => d.vendor_id === v.id).length,
            assessmentsCount: assessments.filter(a => a.vendor_id === v.id).length,
            openIssuesCount: issues.filter(i => i.vendor_id === v.id && i.status === 'open').length,
          })),
          byCategory: vendors.reduce((acc, v) => {
            acc[v.category] = (acc[v.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          totalValue: vendors.reduce((acc, v) => acc + (v.annual_value || 0), 0),
        };
      default:
        return {};
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedTemplate || !reportName) {
      toast({ title: 'Error', description: 'Please select a template and enter a report name', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    const reportData = generateReportData(selectedTemplate);

    const newReport: GeneratedReport = {
      id: `r${Date.now()}`,
      name: reportName,
      template: reportTemplates.find(t => t.id === selectedTemplate)?.name || '',
      generatedAt: new Date(),
      status: 'generating',
      data: reportData,
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
      toast({ title: 'Report Generated', description: `${reportName} is ready to view` });
    }, 1500);

    setReportName('');
    setSelectedTemplate('');
  };

  const handleDownload = (report: GeneratedReport) => {
    // Create downloadable JSON
    const dataStr = JSON.stringify(report.data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Download Started', description: `Downloading ${report.name}...` });
  };

  // Report viewer component
  const renderReportContent = (report: GeneratedReport) => {
    const templateId = reportTemplates.find(t => t.name === report.template)?.id;
    const data = report.data;

    switch (templateId) {
      case 'executive':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-foreground">{data.totalVendors}</p>
                  <p className="text-sm text-muted-foreground">Total Vendors</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-destructive">{data.criticalRisk + data.highRisk}</p>
                  <p className="text-sm text-muted-foreground">High/Critical Risk</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-warning">{data.openIssues}</p>
                  <p className="text-sm text-muted-foreground">Open Issues</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-foreground">${(data.totalAnnualValue / 1000000).toFixed(1)}M</p>
                  <p className="text-sm text-muted-foreground">Annual Spend</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Critical</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(data.criticalRisk / Math.max(1, data.totalVendors)) * 100} className="w-32 h-2" />
                      <span className="text-sm font-medium w-8">{data.criticalRisk}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(data.highRisk / Math.max(1, data.totalVendors)) * 100} className="w-32 h-2" />
                      <span className="text-sm font-medium w-8">{data.highRisk}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medium</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(data.mediumRisk / Math.max(1, data.totalVendors)) * 100} className="w-32 h-2" />
                      <span className="text-sm font-medium w-8">{data.mediumRisk}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Low</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(data.lowRisk / Math.max(1, data.totalVendors)) * 100} className="w-32 h-2" />
                      <span className="text-sm font-medium w-8">{data.lowRisk}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'risk':
        return (
          <div className="space-y-6">
            {data.summary.critical.length > 0 && (
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    Critical Risk Vendors ({data.summary.critical.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.summary.critical.map((v: any) => (
                      <div key={v.id} className="flex items-center justify-between p-2 bg-destructive/10 rounded">
                        <span className="font-medium">{v.name}</span>
                        <Badge variant="destructive">Score: {(v.risk_score || 0).toFixed(1)}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">All Vendors by Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Risk Tier</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Open Issues</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.vendors.slice(0, 20).map((v: any) => (
                      <TableRow key={v.name}>
                        <TableCell className="font-medium">{v.name}</TableCell>
                        <TableCell>{v.category}</TableCell>
                        <TableCell>
                          <Badge variant={v.riskTier === 'critical' || v.riskTier === 'high' ? 'destructive' : 'secondary'}>
                            {v.riskTier}
                          </Badge>
                        </TableCell>
                        <TableCell>{(v.riskScore || 0).toFixed(1)}</TableCell>
                        <TableCell>{v.openIssues}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case 'compliance':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-foreground">{data.complianceRate}%</p>
                  <p className="text-sm text-muted-foreground">Compliance Rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-success">{data.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-warning">{data.inProgress}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-muted-foreground">{data.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assessment Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={data.complianceRate} className="h-4" />
                <p className="text-sm text-muted-foreground mt-2">
                  {data.completed} of {data.totalAssessments} assessments completed
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'assessment':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-warning">{data.byStatus.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-info">{data.byStatus.inProgress}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-success">{data.byStatus.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">All Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                {data.assessments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Assessment</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.assessments.map((a: any) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.title}</TableCell>
                          <TableCell>{a.vendorName}</TableCell>
                          <TableCell>
                            <Badge variant={a.status === 'completed' ? 'default' : 'secondary'}>
                              {a.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(new Date(a.due_date), 'MMM d, yyyy')}</TableCell>
                          <TableCell>{a.score ? `${a.score}%` : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No assessments found</p>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'issues':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-destructive">{data.byStatus.open}</p>
                  <p className="text-sm text-muted-foreground">Open</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-warning">{data.byStatus.inProgress}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-success">{data.byStatus.resolved}</p>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Issues by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-destructive/10 rounded-lg">
                    <p className="text-2xl font-bold text-destructive">{data.bySeverity.critical}</p>
                    <p className="text-sm text-muted-foreground">Critical</p>
                  </div>
                  <div className="text-center p-4 bg-warning/10 rounded-lg">
                    <p className="text-2xl font-bold text-warning">{data.bySeverity.high}</p>
                    <p className="text-sm text-muted-foreground">High</p>
                  </div>
                  <div className="text-center p-4 bg-info/10 rounded-lg">
                    <p className="text-2xl font-bold text-info">{data.bySeverity.medium}</p>
                    <p className="text-sm text-muted-foreground">Medium</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{data.bySeverity.low}</p>
                    <p className="text-sm text-muted-foreground">Low</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">All Issues</CardTitle>
              </CardHeader>
              <CardContent>
                {data.issues.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Issue</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.issues.map((i: any) => (
                        <TableRow key={i.id}>
                          <TableCell className="font-medium">{i.title}</TableCell>
                          <TableCell>{i.vendorName}</TableCell>
                          <TableCell>
                            <Badge variant={i.severity === 'critical' || i.severity === 'high' ? 'destructive' : 'secondary'}>
                              {i.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={i.status === 'resolved' ? 'default' : 'outline'}>
                              {i.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{i.due_date ? format(new Date(i.due_date), 'MMM d, yyyy') : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No issues found</p>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'portfolio':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-foreground">{data.vendors.length}</p>
                  <p className="text-sm text-muted-foreground">Total Vendors</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-foreground">${(data.totalValue / 1000000).toFixed(1)}M</p>
                  <p className="text-sm text-muted-foreground">Total Annual Value</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-foreground">{Object.keys(data.byCategory).length}</p>
                  <p className="text-sm text-muted-foreground">Categories</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vendors by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(data.byCategory).map(([cat, count]) => (
                    <div key={cat} className="p-3 bg-muted rounded-lg text-center">
                      <p className="text-lg font-bold">{count as number}</p>
                      <p className="text-xs text-muted-foreground">{cat}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vendor Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                {data.vendors.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Risk Tier</TableHead>
                        <TableHead>Annual Value</TableHead>
                        <TableHead>Docs</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.vendors.map((v: any) => (
                        <TableRow key={v.id}>
                          <TableCell className="font-medium">{v.name}</TableCell>
                          <TableCell>{v.category}</TableCell>
                          <TableCell>
                            <Badge variant={v.status === 'active' ? 'default' : 'secondary'}>
                              {v.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={v.risk_tier === 'critical' || v.risk_tier === 'high' ? 'destructive' : 'secondary'}>
                              {v.risk_tier}
                            </Badge>
                          </TableCell>
                          <TableCell>${((v.annual_value || 0) / 1000).toFixed(0)}K</TableCell>
                          <TableCell>{v.documentsCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No vendors found</p>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <p className="text-muted-foreground">Report data not available</p>;
    }
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
          {reportHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={report.status !== 'completed'}
                          onClick={() => setViewingReport(report)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={report.status !== 'completed'}
                          onClick={() => handleDownload(report)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileBarChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reports generated yet. Click "Generate Report" to create your first report.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Viewer Dialog */}
      <Dialog open={!!viewingReport} onOpenChange={() => setViewingReport(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingReport?.name}</DialogTitle>
            <DialogDescription>
              {viewingReport?.template} • Generated {viewingReport?.generatedAt.toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {viewingReport && renderReportContent(viewingReport)}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingReport(null)}>Close</Button>
            {viewingReport && (
              <Button onClick={() => handleDownload(viewingReport)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
