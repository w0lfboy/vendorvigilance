import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ExternalLink, 
  Mail, 
  Upload, 
  AlertCircle,
  FileText,
  Shield,
  Activity,
  User,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useVendor, type Vendor } from '@/hooks/useVendors';
import { useAssessments } from '@/hooks/useAssessments';
import { useDocuments } from '@/hooks/useDocuments';
import { useIssues } from '@/hooks/useIssues';
import { AISuggestionsPanel } from '@/components/vendors/AISuggestionsPanel';
import { format, formatDistanceToNow } from 'date-fns';

const riskTierStyles = {
  critical: 'bg-destructive text-destructive-foreground',
  high: 'bg-warning text-warning-foreground',
  medium: 'bg-info text-info-foreground',
  low: 'bg-success text-success-foreground',
};

const statusStyles = {
  active: 'bg-success/10 text-success border-success/30',
  pending: 'bg-warning/10 text-warning border-warning/30',
  offboarded: 'bg-muted text-muted-foreground border-muted-foreground/30',
};

export default function VendorProfile() {
  const { id } = useParams<{ id: string }>();
  const { data: vendor, isLoading, error } = useVendor(id);
  const { assessments } = useAssessments(id);
  const { documents } = useDocuments(id);
  const { issues } = useIssues(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">Vendor not found</h2>
          <Link to="/vendors" className="text-secondary hover:text-secondary/80 mt-2 block">
            ← Back to Vendors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Link */}
      <Link
        to="/vendors"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Vendors
      </Link>

      {/* Header Section */}
      <div className="bg-card rounded-lg shadow-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                {vendor.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-card-foreground">{vendor.name}</h1>
                  <Badge className={cn('text-sm', riskTierStyles[vendor.risk_tier])}>
                    {vendor.risk_tier.toUpperCase()} RISK
                  </Badge>
                  <Badge variant="outline" className={cn(statusStyles[vendor.status])}>
                    {vendor.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                  <span>{vendor.category}</span>
                  {vendor.website && (
                    <>
                      <span>•</span>
                      <a
                        href={`https://${vendor.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-secondary hover:text-secondary/80"
                      >
                        {vendor.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {(vendor.contact_name || vendor.contact_email) && (
              <div className="flex items-center gap-4 text-sm">
                {vendor.contact_name && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Contact:</span>
                    <span className="text-card-foreground font-medium">{vendor.contact_name}</span>
                  </div>
                )}
                {vendor.contact_email && (
                  <a
                    href={`mailto:${vendor.contact_email}`}
                    className="flex items-center gap-1 text-secondary hover:text-secondary/80"
                  >
                    <Mail className="h-4 w-4" />
                    {vendor.contact_email}
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              <Mail className="h-4 w-4 mr-2" />
              Request Update
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
            <Button variant="outline">
              <AlertCircle className="h-4 w-4 mr-2" />
              Create Issue
            </Button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center p-4 bg-background rounded-lg">
            <p className="text-3xl font-bold text-card-foreground">{(vendor.risk_score || 0).toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">Risk Score</p>
          </div>
          <div className="text-center p-4 bg-background rounded-lg">
            <p className="text-3xl font-bold text-card-foreground">${((vendor.annual_value || 0) / 1000).toFixed(0)}K</p>
            <p className="text-sm text-muted-foreground">Annual Value</p>
          </div>
          <div className="text-center p-4 bg-background rounded-lg">
            <p className={cn('text-3xl font-bold', (vendor.open_issues || 0) > 0 ? 'text-warning' : 'text-success')}>
              {issues.filter(i => i.status === 'open').length}
            </p>
            <p className="text-sm text-muted-foreground">Open Issues</p>
          </div>
          <div className="text-center p-4 bg-background rounded-lg">
            <p className="text-3xl font-bold text-card-foreground">{documents.length}</p>
            <p className="text-sm text-muted-foreground">Documents</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="bg-muted p-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="assessments">Assessments ({assessments.length})</TabsTrigger>
              <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
              <TabsTrigger value="issues">Issues ({issues.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="bg-card rounded-lg shadow-card p-6">
                <h3 className="font-semibold text-lg text-card-foreground mb-4">Risk Summary</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Overall Risk Score</span>
                      <span className="font-medium text-card-foreground">{(vendor.risk_score || 0).toFixed(1)}/10</span>
                    </div>
                    <Progress value={(vendor.risk_score || 0) * 10} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="p-3 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground">Last Assessment</p>
                      <p className="font-medium text-card-foreground">
                        {vendor.last_assessment 
                          ? format(new Date(vendor.last_assessment), 'MMM d, yyyy')
                          : 'Never'
                        }
                      </p>
                    </div>
                    <div className="p-3 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground">Next Assessment</p>
                      <p className="font-medium text-card-foreground">
                        {vendor.next_assessment 
                          ? format(new Date(vendor.next_assessment), 'MMM d, yyyy')
                          : 'Not scheduled'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg shadow-card p-6">
                <h3 className="font-semibold text-lg text-card-foreground mb-4">Continuous Monitoring</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-background rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-success" />
                      <span className="font-medium text-card-foreground">Security Posture</span>
                    </div>
                    <p className="text-2xl font-bold text-success">Good</p>
                    <p className="text-sm text-muted-foreground">Last checked 2 hours ago</p>
                  </div>
                  <div className="p-4 bg-background rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-5 w-5 text-info" />
                      <span className="font-medium text-card-foreground">Assessments</span>
                    </div>
                    <p className="text-2xl font-bold text-card-foreground">{assessments.length}</p>
                    <p className="text-sm text-muted-foreground">Total conducted</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="assessments" className="space-y-4">
              {assessments.length > 0 ? (
                assessments.map((assessment) => (
                  <div key={assessment.id} className="bg-card rounded-lg shadow-card p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-card-foreground">{assessment.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Due: {format(new Date(assessment.due_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Badge variant={assessment.status === 'completed' ? 'default' : 'outline'}>
                        {assessment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-card rounded-lg shadow-card p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No assessments found for this vendor</p>
                  <Link to="/assessments">
                    <Button className="mt-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                      Create Assessment
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <div key={doc.id} className="bg-card rounded-lg shadow-card p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent rounded-lg">
                          <FileText className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-card-foreground">{doc.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Uploaded {format(new Date(doc.upload_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <Badge variant={doc.status === 'active' ? 'default' : 'destructive'}>
                        {doc.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-card rounded-lg shadow-card p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No documents found for this vendor</p>
                  <Link to="/documents">
                    <Button className="mt-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                      Upload Document
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="issues" className="space-y-4">
              {issues.length > 0 ? (
                issues.map((issue) => (
                  <div key={issue.id} className="bg-card rounded-lg shadow-card p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-card-foreground">{issue.title}</h4>
                          <Badge variant={issue.severity === 'critical' ? 'destructive' : 'outline'}>
                            {issue.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                      </div>
                      <Badge variant={issue.status === 'resolved' ? 'default' : 'secondary'}>
                        {issue.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-card rounded-lg shadow-card p-8 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No issues found for this vendor</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - AI Assistant */}
        <div className="space-y-6">
          <AISuggestionsPanel vendor={vendor} />

          {/* Quick Actions */}
          <div className="bg-card rounded-lg shadow-card p-6">
            <h3 className="font-semibold text-lg text-card-foreground mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/assessments">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Request Assessment
                </Button>
              </Link>
              <Link to="/documents">
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Send Reminder
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
