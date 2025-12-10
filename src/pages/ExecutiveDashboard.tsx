import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Shield, 
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { useVendors } from '@/hooks/useVendors';
import { useAssessments } from '@/hooks/useAssessments';

// Risk trend data (mock for demo)
const riskTrendData = [
  { month: 'Jul', avgRisk: 4.2, highRiskCount: 3 },
  { month: 'Aug', avgRisk: 4.5, highRiskCount: 4 },
  { month: 'Sep', avgRisk: 4.1, highRiskCount: 3 },
  { month: 'Oct', avgRisk: 4.8, highRiskCount: 5 },
  { month: 'Nov', avgRisk: 4.3, highRiskCount: 4 },
  { month: 'Dec', avgRisk: 4.6, highRiskCount: 4 },
];

// Compliance framework data (mock)
const complianceData = [
  { framework: 'SOC 2', compliant: 85, partial: 10, nonCompliant: 5 },
  { framework: 'ISO 27001', compliant: 78, partial: 15, nonCompliant: 7 },
  { framework: 'GDPR', compliant: 92, partial: 5, nonCompliant: 3 },
  { framework: 'PCI DSS', compliant: 70, partial: 20, nonCompliant: 10 },
  { framework: 'HIPAA', compliant: 88, partial: 8, nonCompliant: 4 },
];

// Define colors as CSS custom properties for charts
const CHART_COLORS = {
  critical: '#DC2626', // red-600
  high: '#F59E0B', // amber-500
  medium: '#3B82F6', // blue-500
  low: '#10B981', // emerald-500
  primary: '#0EA5E9', // sky-500
  compliant: '#10B981',
  partial: '#F59E0B',
  nonCompliant: '#DC2626',
};

const chartConfig = {
  critical: { label: 'Critical', color: CHART_COLORS.critical },
  high: { label: 'High', color: CHART_COLORS.high },
  medium: { label: 'Medium', color: CHART_COLORS.medium },
  low: { label: 'Low', color: CHART_COLORS.low },
};

export default function ExecutiveDashboard() {
  const { vendors } = useVendors();
  const { assessments } = useAssessments();

  // Calculate metrics from real data
  const riskDistribution = [
    { name: 'Critical', value: vendors.filter(v => v.risk_tier === 'critical').length, color: CHART_COLORS.critical },
    { name: 'High', value: vendors.filter(v => v.risk_tier === 'high').length, color: CHART_COLORS.high },
    { name: 'Medium', value: vendors.filter(v => v.risk_tier === 'medium').length, color: CHART_COLORS.medium },
    { name: 'Low', value: vendors.filter(v => v.risk_tier === 'low').length, color: CHART_COLORS.low },
  ];

  const totalVendors = vendors.length;
  const avgRiskScore = vendors.length > 0 
    ? (vendors.reduce((sum, v) => sum + (v.risk_score || 0), 0) / vendors.length).toFixed(1)
    : '0';
  const completedAssessments = assessments.filter(a => a.status === 'completed').length;
  const pendingAssessments = assessments.filter(a => a.status === 'pending' || a.status === 'in_progress').length;
  const totalOpenIssues = vendors.reduce((sum, v) => sum + (v.open_issues || 0), 0);

  // Top risk vendors
  const topRiskVendors = [...vendors]
    .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Executive Dashboard</h1>
          <p className="text-muted-foreground">Third-party risk overview and compliance status</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Vendors</p>
                <p className="text-3xl font-bold">{totalVendors}</p>
              </div>
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Risk Score</p>
                <p className="text-3xl font-bold">{avgRiskScore}</p>
              </div>
              <Shield className="h-8 w-8 text-warning" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingDown className="h-4 w-4 text-success" />
              <span className="text-success">-0.3</span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assessments Done</p>
                <p className="text-3xl font-bold">{completedAssessments}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                <p className="text-3xl font-bold">{pendingAssessments}</p>
              </div>
              <Clock className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Issues</p>
                <p className="text-3xl font-bold">{totalOpenIssues}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Donut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vendor Risk Distribution</CardTitle>
            <CardDescription>By risk tier classification</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex justify-center gap-4 mt-4">
              {riskDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Trend Line Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Risk Trend Over Time</CardTitle>
            <CardDescription>Average risk score and high-risk vendor count</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <LineChart data={riskTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="avgRisk" 
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.primary }}
                  name="Avg Risk Score"
                />
                <Line 
                  type="monotone" 
                  dataKey="highRiskCount" 
                  stroke={CHART_COLORS.critical}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.critical }}
                  name="High Risk Count"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Status Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compliance Framework Status</CardTitle>
          <CardDescription>Vendor compliance across regulatory frameworks</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={complianceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis dataKey="framework" type="category" tick={{ fill: '#94A3B8', fontSize: 12 }} width={80} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend wrapperStyle={{ color: '#94A3B8' }} />
              <Bar dataKey="compliant" stackId="a" fill={CHART_COLORS.compliant} name="Compliant" />
              <Bar dataKey="partial" stackId="a" fill={CHART_COLORS.partial} name="Partial" />
              <Bar dataKey="nonCompliant" stackId="a" fill={CHART_COLORS.nonCompliant} name="Non-Compliant" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Risk Vendors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Highest Risk Vendors</CardTitle>
            <CardDescription>Vendors requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topRiskVendors.map((vendor, idx) => (
                <div key={vendor.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-6">{idx + 1}.</span>
                    <div>
                      <p className="font-medium">{vendor.name}</p>
                      <p className="text-sm text-muted-foreground">{vendor.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      vendor.risk_tier === 'critical' ? 'destructive' :
                      vendor.risk_tier === 'high' ? 'default' : 'secondary'
                    }>
                      {vendor.risk_tier}
                    </Badge>
                    <span className="font-mono text-sm font-medium">{vendor.risk_score?.toFixed(1)}</span>
                  </div>
                </div>
              ))}
              {topRiskVendors.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No vendors found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assessment Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assessment Pipeline</CardTitle>
            <CardDescription>Current assessment status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Pending</span>
                  <span>{assessments.filter(a => a.status === 'pending').length}</span>
                </div>
                <Progress value={assessments.length > 0 ? (assessments.filter(a => a.status === 'pending').length / assessments.length) * 100 : 0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>In Progress</span>
                  <span>{assessments.filter(a => a.status === 'in_progress').length}</span>
                </div>
                <Progress value={assessments.length > 0 ? (assessments.filter(a => a.status === 'in_progress').length / assessments.length) * 100 : 0} className="h-2 bg-secondary" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Under Review</span>
                  <span>{assessments.filter(a => a.status === 'under_review').length}</span>
                </div>
                <Progress value={assessments.length > 0 ? (assessments.filter(a => a.status === 'under_review').length / assessments.length) * 100 : 0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Completed</span>
                  <span>{completedAssessments}</span>
                </div>
                <Progress value={assessments.length > 0 ? (completedAssessments / assessments.length) * 100 : 0} className="h-2" />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <FileText className="h-4 w-4 inline mr-1" />
                  Total assessments this quarter
                </div>
                <span className="text-2xl font-bold">{assessments.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
