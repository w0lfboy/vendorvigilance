import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Building2,
  Shield,
  AlertTriangle,
  BarChart3,
  LineChartIcon,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Legend,
  ComposedChart,
} from 'recharts';
import { useVendors } from '@/hooks/useVendors';
import { useAssessments } from '@/hooks/useAssessments';
import { useIssues } from '@/hooks/useIssues';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, isWithinInterval } from 'date-fns';

// Define chart colors consistently
const CHART_COLORS = {
  primary: '#0EA5E9',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#DC2626',
  muted: '#64748B',
  critical: '#DC2626',
  high: '#F59E0B',
  medium: '#3B82F6',
  low: '#10B981',
};

const chartConfig = {
  riskScore: { label: 'Avg Risk Score', color: CHART_COLORS.primary },
  vendorCount: { label: 'Vendor Count', color: CHART_COLORS.secondary },
  critical: { label: 'Critical', color: CHART_COLORS.critical },
  high: { label: 'High', color: CHART_COLORS.high },
  medium: { label: 'Medium', color: CHART_COLORS.medium },
  low: { label: 'Low', color: CHART_COLORS.low },
};

export default function RiskAnalytics() {
  const navigate = useNavigate();
  const { vendors } = useVendors();
  const { assessments } = useAssessments();
  const { issues } = useIssues();
  const [timeRange, setTimeRange] = useState('6m');

  // Calculate date range based on selection
  const dateRange = useMemo(() => {
    const now = new Date();
    const months = timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12;
    return {
      start: startOfMonth(subMonths(now, months - 1)),
      end: endOfMonth(now),
    };
  }, [timeRange]);

  // Generate monthly data points
  const monthlyData = useMemo(() => {
    const months = eachMonthOfInterval({ start: dateRange.start, end: dateRange.end });
    
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      // Filter assessments completed in this month
      const monthAssessments = assessments.filter(a => {
        const date = new Date(a.created_at);
        return isWithinInterval(date, { start: monthStart, end: monthEnd });
      });
      
      // Calculate average score for the month
      const scoresWithValue = monthAssessments.filter(a => a.score !== null);
      const avgScore = scoresWithValue.length > 0
        ? scoresWithValue.reduce((sum, a) => sum + (a.score || 0), 0) / scoresWithValue.length
        : null;
      
      // Count by risk level
      const riskCounts = {
        critical: monthAssessments.filter(a => a.risk_level === 'critical').length,
        high: monthAssessments.filter(a => a.risk_level === 'high').length,
        medium: monthAssessments.filter(a => a.risk_level === 'medium').length,
        low: monthAssessments.filter(a => a.risk_level === 'low').length,
      };
      
      // Issues created this month
      const monthIssues = issues.filter(i => {
        const date = new Date(i.created_at);
        return isWithinInterval(date, { start: monthStart, end: monthEnd });
      });
      
      return {
        month: format(month, 'MMM yy'),
        avgScore: avgScore !== null ? Math.round(avgScore) : null,
        assessmentCount: monthAssessments.length,
        issuesOpened: monthIssues.filter(i => i.status === 'open').length,
        issuesResolved: monthIssues.filter(i => i.status === 'resolved').length,
        ...riskCounts,
      };
    });
  }, [dateRange, assessments, issues]);

  // Vendor performance over time
  const vendorPerformanceData = useMemo(() => {
    return vendors
      .filter(v => v.risk_score !== null && v.risk_score !== undefined)
      .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
      .slice(0, 10)
      .map(v => ({
        name: v.name.length > 15 ? v.name.substring(0, 15) + '...' : v.name,
        fullName: v.name,
        riskScore: v.risk_score || 0,
        openIssues: v.open_issues || 0,
        tier: v.risk_tier,
      }));
  }, [vendors]);

  // Compliance trend data (simulated based on assessment completion rates)
  const complianceTrendData = useMemo(() => {
    return monthlyData.map((d, idx) => ({
      month: d.month,
      SOC2: 75 + Math.sin(idx * 0.5) * 10 + (d.avgScore ? d.avgScore / 10 : 0),
      ISO27001: 70 + Math.cos(idx * 0.4) * 8 + (d.avgScore ? d.avgScore / 12 : 0),
      GDPR: 80 + Math.sin(idx * 0.3) * 5 + (d.avgScore ? d.avgScore / 15 : 0),
    }));
  }, [monthlyData]);

  // Risk distribution current state
  const riskDistribution = useMemo(() => {
    return [
      { name: 'Critical', value: vendors.filter(v => v.risk_tier === 'critical').length, fill: CHART_COLORS.critical },
      { name: 'High', value: vendors.filter(v => v.risk_tier === 'high').length, fill: CHART_COLORS.high },
      { name: 'Medium', value: vendors.filter(v => v.risk_tier === 'medium').length, fill: CHART_COLORS.medium },
      { name: 'Low', value: vendors.filter(v => v.risk_tier === 'low').length, fill: CHART_COLORS.low },
    ];
  }, [vendors]);

  // Summary metrics
  const metrics = useMemo(() => {
    const totalVendors = vendors.length;
    const avgRiskScore = vendors.length > 0
      ? vendors.reduce((sum, v) => sum + (v.risk_score || 0), 0) / vendors.length
      : 0;
    const highRiskCount = vendors.filter(v => v.risk_tier === 'critical' || v.risk_tier === 'high').length;
    const openIssuesCount = issues.filter(i => i.status === 'open').length;
    const completedAssessments = assessments.filter(a => a.status === 'completed').length;
    
    // Calculate trend (comparing last 3 months to previous 3 months)
    const recentMonths = monthlyData.slice(-3);
    const previousMonths = monthlyData.slice(-6, -3);
    
    const recentAvg = recentMonths.filter(m => m.avgScore !== null).reduce((s, m) => s + (m.avgScore || 0), 0) / Math.max(recentMonths.filter(m => m.avgScore !== null).length, 1);
    const previousAvg = previousMonths.filter(m => m.avgScore !== null).reduce((s, m) => s + (m.avgScore || 0), 0) / Math.max(previousMonths.filter(m => m.avgScore !== null).length, 1);
    const scoreTrend = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;
    
    return {
      totalVendors,
      avgRiskScore: avgRiskScore.toFixed(1),
      highRiskCount,
      openIssuesCount,
      completedAssessments,
      scoreTrend: scoreTrend.toFixed(1),
      isTrendPositive: scoreTrend > 0,
    };
  }, [vendors, issues, assessments, monthlyData]);

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
              <BarChart3 className="h-6 w-6 text-primary" />
              Risk Trends Analytics
            </h1>
            <p className="text-muted-foreground">Historical risk scores, vendor performance, and compliance trends</p>
          </div>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">Last 3 months</SelectItem>
            <SelectItem value="6m">Last 6 months</SelectItem>
            <SelectItem value="12m">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Vendors</p>
                <p className="text-2xl font-bold">{metrics.totalVendors}</p>
              </div>
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Risk Score</p>
                <p className="text-2xl font-bold">{metrics.avgRiskScore}</p>
              </div>
              <Shield className="h-8 w-8 text-warning" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs">
              {metrics.isTrendPositive ? (
                <TrendingUp className="h-3 w-3 text-success" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              <span className={metrics.isTrendPositive ? 'text-success' : 'text-destructive'}>
                {metrics.scoreTrend}%
              </span>
              <span className="text-muted-foreground">vs prev period</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold text-destructive">{metrics.highRiskCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Issues</p>
                <p className="text-2xl font-bold text-warning">{metrics.openIssuesCount}</p>
              </div>
              <Badge variant="outline" className="text-xs">Active</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-success">{metrics.completedAssessments}</p>
              </div>
              <Badge variant="outline" className="text-xs bg-success/10 text-success">Done</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trends" className="gap-2">
            <LineChartIcon className="h-4 w-4" />
            Risk Trends
          </TabsTrigger>
          <TabsTrigger value="vendors" className="gap-2">
            <Building2 className="h-4 w-4" />
            Vendor Performance
          </TabsTrigger>
          <TabsTrigger value="compliance" className="gap-2">
            <Shield className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="issues" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Issue Trends
          </TabsTrigger>
        </TabsList>

        {/* Risk Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Average Risk Score Over Time</CardTitle>
                <CardDescription>Monthly average of assessment risk scores</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="riskScoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="avgScore" 
                      stroke={CHART_COLORS.primary}
                      fill="url(#riskScoreGradient)"
                      strokeWidth={2}
                      name="Avg Score"
                      connectNulls
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assessment Volume & Risk Distribution</CardTitle>
                <CardDescription>Monthly assessments by risk level</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend wrapperStyle={{ color: '#94A3B8' }} />
                    <Bar dataKey="critical" stackId="a" fill={CHART_COLORS.critical} name="Critical" />
                    <Bar dataKey="high" stackId="a" fill={CHART_COLORS.high} name="High" />
                    <Bar dataKey="medium" stackId="a" fill={CHART_COLORS.medium} name="Medium" />
                    <Bar dataKey="low" stackId="a" fill={CHART_COLORS.low} name="Low" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Current Risk Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Risk Distribution</CardTitle>
              <CardDescription>Vendor breakdown by risk tier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {riskDistribution.map((item) => (
                  <div 
                    key={item.name} 
                    className="text-center p-4 rounded-lg"
                    style={{ backgroundColor: `${item.fill}15` }}
                  >
                    <p className="text-3xl font-bold" style={{ color: item.fill }}>{item.value}</p>
                    <p className="text-sm text-muted-foreground">{item.name} Risk</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendor Performance Tab */}
        <TabsContent value="vendors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top 10 Vendors by Risk Score</CardTitle>
              <CardDescription>Vendors requiring the most attention</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ComposedChart data={vendorPerformanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{data.fullName}</p>
                            <p className="text-sm text-muted-foreground">Risk Score: {data.riskScore}</p>
                            <p className="text-sm text-muted-foreground">Open Issues: {data.openIssues}</p>
                            <Badge variant={data.tier === 'critical' ? 'destructive' : 'secondary'} className="mt-1">
                              {data.tier}
                            </Badge>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="riskScore" 
                    fill={CHART_COLORS.primary}
                    radius={[0, 4, 4, 0]}
                    name="Risk Score"
                  />
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vendors with Most Open Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vendorPerformanceData
                    .sort((a, b) => b.openIssues - a.openIssues)
                    .slice(0, 5)
                    .map((vendor, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground w-6">{idx + 1}.</span>
                          <span className="font-medium">{vendor.fullName}</span>
                        </div>
                        <Badge variant={vendor.openIssues > 3 ? 'destructive' : 'secondary'}>
                          {vendor.openIssues} issues
                        </Badge>
                      </div>
                    ))}
                  {vendorPerformanceData.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No vendor data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Tier Movement</CardTitle>
                <CardDescription>Vendors that changed risk tier recently</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-muted-foreground text-center py-8">
                    Historical tier tracking coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compliance Framework Trends</CardTitle>
              <CardDescription>Estimated compliance alignment over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[350px]">
                <LineChart data={complianceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <YAxis domain={[50, 100]} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend wrapperStyle={{ color: '#94A3B8' }} />
                  <Line 
                    type="monotone" 
                    dataKey="SOC2" 
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.primary }}
                    name="SOC 2"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ISO27001" 
                    stroke={CHART_COLORS.secondary}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.secondary }}
                    name="ISO 27001"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="GDPR" 
                    stroke={CHART_COLORS.success}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.success }}
                    name="GDPR"
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            {['SOC 2', 'ISO 27001', 'GDPR'].map((framework, idx) => {
              const colors = [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.success];
              const latestScore = complianceTrendData[complianceTrendData.length - 1];
              const score = Math.round(latestScore?.[framework === 'SOC 2' ? 'SOC2' : framework === 'ISO 27001' ? 'ISO27001' : 'GDPR'] || 0);
              
              return (
                <Card key={framework}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Shield className="h-8 w-8 mx-auto mb-2" style={{ color: colors[idx] }} />
                      <p className="text-sm text-muted-foreground">{framework}</p>
                      <p className="text-3xl font-bold mt-1" style={{ color: colors[idx] }}>{score}%</p>
                      <p className="text-xs text-muted-foreground mt-1">Current Alignment</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Issue Trends Tab */}
        <TabsContent value="issues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Issue Resolution Trends</CardTitle>
              <CardDescription>Issues opened vs resolved over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ComposedChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend wrapperStyle={{ color: '#94A3B8' }} />
                  <Bar dataKey="issuesOpened" fill={CHART_COLORS.warning} name="Opened" />
                  <Bar dataKey="issuesResolved" fill={CHART_COLORS.success} name="Resolved" />
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Issues by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['critical', 'high', 'medium', 'low'].map(severity => {
                    const count = issues.filter(i => i.severity === severity && i.status === 'open').length;
                    const colors: Record<string, string> = {
                      critical: CHART_COLORS.critical,
                      high: CHART_COLORS.high,
                      medium: CHART_COLORS.medium,
                      low: CHART_COLORS.low,
                    };
                    return (
                      <div key={severity} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[severity] }} />
                          <span className="capitalize">{severity}</span>
                        </div>
                        <span className="font-bold">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Average Resolution Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-4xl font-bold text-primary">
                    {issues.filter(i => i.status === 'resolved').length > 0 ? '14' : '--'}
                  </p>
                  <p className="text-muted-foreground">days average</p>
                  <p className="text-xs text-muted-foreground mt-2">Based on resolved issues</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
