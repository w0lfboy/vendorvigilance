import { Building2, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { ActionBar } from '@/components/dashboard/ActionBar';
import { AlertCard } from '@/components/dashboard/AlertCard';
import { TaskList } from '@/components/dashboard/TaskList';
import { RiskHeatMap } from '@/components/dashboard/RiskHeatMap';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { useAuth } from '@/hooks/useAuth';
import { 
  dashboardStats, 
  alerts, 
  tasks, 
  activities, 
  riskHeatMapData 
} from '@/data/mockData';

export default function Dashboard() {
  const { user } = useAuth();
  const displayName = user?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">Welcome back, {displayName}. Here's your risk overview.</p>
        </div>
        <ActionBar />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KPICard
          title="Active Vendors"
          value={dashboardStats.activeVendors}
          icon={Building2}
          trend={{ value: 12, isPositive: true }}
        />
        <KPICard
          title="Overdue Assessments"
          value={dashboardStats.overdueAssessments}
          icon={AlertTriangle}
          variant="danger"
        />
        <KPICard
          title="High Risk Vendors"
          value={dashboardStats.highRiskVendors}
          icon={AlertCircle}
          variant="warning"
        />
        <KPICard
          title="Recent Completions"
          value={dashboardStats.recentCompletions}
          icon={CheckCircle2}
          trend={{ value: 8, isPositive: true }}
          variant="success"
        />
      </div>

      {/* Urgent Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Requires Immediate Attention
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <TaskList tasks={tasks} />
          <ActivityFeed activities={activities} />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          <RiskHeatMap data={riskHeatMapData} />
        </div>
      </div>
    </div>
  );
}
