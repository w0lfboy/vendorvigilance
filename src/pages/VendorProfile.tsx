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
  Clock,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { vendors, assessments, documents, activities } from '@/data/mockData';
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
  const vendor = vendors.find((v) => v.id === id);

  if (!vendor) {
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

  const vendorAssessments = assessments.filter((a) => a.vendorId === vendor.id);
  const vendorDocuments = documents.filter((d) => d.vendorId === vendor.id);
  const vendorActivities = activities.filter((a) => a.vendorName === vendor.name).slice(0, 5);

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
                  <Badge className={cn('text-sm', riskTierStyles[vendor.riskTier])}>
                    {vendor.riskTier.toUpperCase()} RISK
                  </Badge>
                  <Badge variant="outline" className={cn(statusStyles[vendor.status])}>
                    {vendor.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                  <span>{vendor.category}</span>
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
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Contact:</span>
                <span className="text-card-foreground font-medium">{vendor.contactName}</span>
              </div>
              <a
                href={`mailto:${vendor.contactEmail}`}
                className="flex items-center gap-1 text-secondary hover:text-secondary/80"
              >
                <Mail className="h-4 w-4" />
                {vendor.contactEmail}
              </a>
            </div>
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
            <p className="text-3xl font-bold text-card-foreground">{vendor.riskScore.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">Risk Score</p>
          </div>
          <div className="text-center p-4 bg-background rounded-lg">
            <p className="text-3xl font-bold text-card-foreground">${(vendor.annualValue / 1000).toFixed(0)}K</p>
            <p className="text-sm text-muted-foreground">Annual Value</p>
          </div>
          <div className="text-center p-4 bg-background rounded-lg">
            <p className={cn('text-3xl font-bold', vendor.openIssues > 0 ? 'text-warning' : 'text-success')}>
              {vendor.openIssues}
            </p>
            <p className="text-sm text-muted-foreground">Open Issues</p>
          </div>
          <div className="text-center p-4 bg-background rounded-lg">
            <p className="text-3xl font-bold text-card-foreground">{vendor.documentsCount}</p>
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
              <TabsTrigger value="assessments">Assessments</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Risk Summary */}
              <div className="bg-card rounded-lg shadow-card p-6">
                <h3 className="font-semibold text-lg text-card-foreground mb-4">Risk Summary</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Overall Risk Score</span>
                      <span className="font-medium text-card-foreground">{vendor.riskScore}/10</span>
                    </div>
                    <Progress value={vendor.riskScore * 10} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="p-3 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground">Last Assessment</p>
                      <p className="font-medium text-card-foreground">{format(vendor.lastAssessment, 'MMM d, yyyy')}</p>
                    </div>
                    <div className="p-3 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground">Next Assessment</p>
                      <p className="font-medium text-card-foreground">{format(vendor.nextAssessment, 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Relationship Graph */}
              <div className="bg-card rounded-lg shadow-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg text-card-foreground">Relationship Graph</h3>
                  <button className="text-sm text-secondary hover:text-secondary/80">Expand ↗</button>
                </div>
                <div className="relative h-64 bg-background rounded-lg flex items-center justify-center">
                  <RelationshipGraph vendorName={vendor.name} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="assessments" className="space-y-4">
              {vendorAssessments.length > 0 ? (
                vendorAssessments.map((assessment) => (
                  <div key={assessment.id} className="bg-card rounded-lg shadow-card p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-card-foreground">{assessment.templateName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Due: {format(assessment.dueDate, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Badge variant={assessment.status === 'completed' ? 'default' : 'outline'}>
                        {assessment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{assessment.progress}%</span>
                      </div>
                      <Progress value={assessment.progress} className="h-2" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-card rounded-lg shadow-card p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No assessments found for this vendor</p>
                  <Button className="mt-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Create Assessment
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              {vendorDocuments.length > 0 ? (
                vendorDocuments.map((doc) => (
                  <div key={doc.id} className="bg-card rounded-lg shadow-card p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent rounded-lg">
                          <FileText className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-card-foreground">{doc.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Uploaded {format(doc.uploadDate, 'MMM d, yyyy')}
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
                  <Button className="mt-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Upload Document
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-4">
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
                      <span className="font-medium text-card-foreground">News & Media</span>
                    </div>
                    <p className="text-2xl font-bold text-card-foreground">3</p>
                    <p className="text-sm text-muted-foreground">Recent mentions</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <div className="bg-card rounded-lg shadow-card p-6">
                <h3 className="font-semibold text-lg text-card-foreground mb-4">Activity Timeline</h3>
                <div className="space-y-4">
                  {vendorActivities.length > 0 ? (
                    vendorActivities.map((activity) => (
                      <div key={activity.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-secondary rounded-full" />
                          <div className="w-px h-full bg-border" />
                        </div>
                        <div className="pb-4">
                          <p className="font-medium text-card-foreground">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No recent activity</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - AI Assistant */}
        <div className="space-y-6">
          {/* AI Suggestions Card */}
          <div className="bg-gradient-to-br from-secondary to-primary rounded-lg shadow-card p-6 text-secondary-foreground">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg">AI Suggestions</h3>
            </div>
            
            <div className="space-y-3">
              <AISuggestion
                icon={AlertCircle}
                text="Review overdue SOC 2 assessment - expires in 15 days"
                priority="high"
              />
              <AISuggestion
                icon={Clock}
                text="Schedule quarterly security review with vendor"
                priority="medium"
              />
              <AISuggestion
                icon={CheckCircle2}
                text="Request updated insurance certificate"
                priority="low"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-lg shadow-card p-6">
            <h3 className="font-semibold text-lg text-card-foreground mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Request Assessment
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
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

function AISuggestion({ icon: Icon, text, priority }: { icon: any; text: string; priority: string }) {
  return (
    <div className="bg-white/10 rounded-lg p-3">
      <div className="flex items-start gap-3">
        <Icon className="h-4 w-4 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm">{text}</p>
          <Button size="sm" variant="secondary" className="mt-2 h-7 text-xs bg-white/20 hover:bg-white/30 text-secondary-foreground">
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}

function RelationshipGraph({ vendorName }: { vendorName: string }) {
  const connections = [
    { name: 'Your Company', angle: 0 },
    { name: 'Data Center A', angle: 72 },
    { name: 'Cloud Provider', angle: 144 },
    { name: 'Payment Gateway', angle: 216 },
    { name: 'Auth Service', angle: 288 },
  ];

  return (
    <div className="relative w-full h-full">
      {/* Center node */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground text-xs font-medium text-center p-2 z-10 shadow-lg">
        {vendorName.split(' ')[0]}
      </div>
      
      {/* Connection nodes */}
      {connections.map((conn, i) => {
        const radius = 90;
        const x = Math.cos((conn.angle * Math.PI) / 180) * radius;
        const y = Math.sin((conn.angle * Math.PI) / 180) * radius;
        
        return (
          <div key={i}>
            {/* Connection line */}
            <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
              <line
                x1="50%"
                y1="50%"
                x2={`calc(50% + ${x}px)`}
                y2={`calc(50% + ${y}px)`}
                stroke="hsl(var(--border))"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>
            {/* Node */}
            <div
              className="absolute w-14 h-14 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-[10px] text-center p-1 shadow-sm border border-border"
              style={{
                top: `calc(50% + ${y}px)`,
                left: `calc(50% + ${x}px)`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {conn.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
