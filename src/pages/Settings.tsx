import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Settings as SettingsIcon, 
  Plug, 
  FolderArchive, 
  Clock,
  Shield,
  Bell,
  Palette,
  Globe,
  Key,
  Trash2,
  Plus,
  ExternalLink,
  Check,
  X,
  Building2,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/hooks/useOrganization';
import { OrganizationMembers } from '@/components/organization/OrganizationMembers';
import { OrganizationSettings } from '@/components/organization/OrganizationSettings';
import { NoOrganizationState } from '@/components/organization/NoOrganizationState';

// Mock API connections
const mockApiConnections = [
  { id: '1', name: 'Slack', status: 'connected', lastSync: '2024-01-15 10:30 AM' },
  { id: '2', name: 'Microsoft 365', status: 'connected', lastSync: '2024-01-15 09:00 AM' },
  { id: '3', name: 'Jira', status: 'disconnected', lastSync: 'Never' },
  { id: '4', name: 'ServiceNow', status: 'disconnected', lastSync: 'Never' },
];

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('organization');

  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    slackNotifications: false,
    weeklyDigest: true,
    riskAlerts: true,
    assessmentReminders: true,
    darkMode: false,
    language: 'en',
    timezone: 'America/New_York',
  });

  // Retention policies state
  const [retentionPolicies, setRetentionPolicies] = useState({
    assessmentRetention: '3years',
    documentRetention: '5years',
    activityLogRetention: '1year',
    autoArchive: true,
    autoDelete: false,
  });

  const handleSavePreferences = () => {
    toast({ title: 'Preferences saved', description: 'Your preferences have been updated.' });
  };

  const handleSaveRetention = () => {
    toast({ title: 'Retention policies saved', description: 'Your retention policies have been updated.' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your organization settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="organization" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Organization</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Plug className="h-4 w-4" />
            <span className="hidden sm:inline">API</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FolderArchive className="h-4 w-4" />
            <span className="hidden sm:inline">Documents</span>
          </TabsTrigger>
          <TabsTrigger value="retention" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Retention</span>
          </TabsTrigger>
        </TabsList>

        {/* Organization Tab */}
        <TabsContent value="organization" className="space-y-6">
          <OrganizationSettings />
          
          {/* Questionnaire Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Questionnaire Templates
              </CardTitle>
              <CardDescription>Create and manage assessment questionnaires</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/questionnaire-builder">
                <Button className="bg-secondary hover:bg-secondary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Template
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <OrganizationMembers />

          {/* Roles & Permissions info card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Roles & Permissions
              </CardTitle>
              <CardDescription>Organization role capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border bg-card">
                  <h4 className="font-semibold mb-2">Owner</h4>
                  <p className="text-sm text-muted-foreground mb-3">Full organization control</p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2"><Check className="h-3 w-3 text-success" /> Manage organization</li>
                    <li className="flex items-center gap-2"><Check className="h-3 w-3 text-success" /> Add/remove users</li>
                    <li className="flex items-center gap-2"><Check className="h-3 w-3 text-success" /> Delete vendors</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <h4 className="font-semibold mb-2">Admin</h4>
                  <p className="text-sm text-muted-foreground mb-3">User management access</p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2"><Check className="h-3 w-3 text-success" /> Invite users</li>
                    <li className="flex items-center gap-2"><Check className="h-3 w-3 text-success" /> Manage roles</li>
                    <li className="flex items-center gap-2"><X className="h-3 w-3 text-destructive" /> Remove users</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <h4 className="font-semibold mb-2">Member</h4>
                  <p className="text-sm text-muted-foreground mb-3">Standard access</p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2"><Check className="h-3 w-3 text-success" /> View vendors</li>
                    <li className="flex items-center gap-2"><Check className="h-3 w-3 text-success" /> Manage vendors</li>
                    <li className="flex items-center gap-2"><X className="h-3 w-3 text-destructive" /> User management</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => setPreferences(p => ({ ...p, emailNotifications: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="slackNotifications">Slack Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications in Slack</p>
                </div>
                <Switch
                  id="slackNotifications"
                  checked={preferences.slackNotifications}
                  onCheckedChange={(checked) => setPreferences(p => ({ ...p, slackNotifications: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weeklyDigest">Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">Receive a weekly summary email</p>
                </div>
                <Switch
                  id="weeklyDigest"
                  checked={preferences.weeklyDigest}
                  onCheckedChange={(checked) => setPreferences(p => ({ ...p, weeklyDigest: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="riskAlerts">Risk Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get alerted when risk scores change</p>
                </div>
                <Switch
                  id="riskAlerts"
                  checked={preferences.riskAlerts}
                  onCheckedChange={(checked) => setPreferences(p => ({ ...p, riskAlerts: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="assessmentReminders">Assessment Reminders</Label>
                  <p className="text-sm text-muted-foreground">Remind about upcoming assessments</p>
                </div>
                <Switch
                  id="assessmentReminders"
                  checked={preferences.assessmentReminders}
                  onCheckedChange={(checked) => setPreferences(p => ({ ...p, assessmentReminders: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Display Settings
              </CardTitle>
              <CardDescription>Customize your display preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="darkMode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Use dark theme</p>
                </div>
                <Switch
                  id="darkMode"
                  checked={preferences.darkMode}
                  onCheckedChange={(checked) => setPreferences(p => ({ ...p, darkMode: checked }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={preferences.language} onValueChange={(v) => setPreferences(p => ({ ...p, language: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={preferences.timezone} onValueChange={(v) => setPreferences(p => ({ ...p, timezone: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSavePreferences} className="bg-secondary hover:bg-secondary/90">
              Save Preferences
            </Button>
          </div>
        </TabsContent>

        {/* API Connections Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                Integrations
              </CardTitle>
              <CardDescription>Connect third-party services to enhance your workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockApiConnections.map((api) => (
                  <div key={api.id} className="p-4 rounded-lg border bg-card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{api.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {api.status === 'connected' ? `Last sync: ${api.lastSync}` : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={api.status === 'connected' ? 'outline' : 'default'}
                      size="sm"
                      className={api.status === 'connected' ? '' : 'bg-secondary hover:bg-secondary/90'}
                    >
                      {api.status === 'connected' ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Keys
                </CardTitle>
                <CardDescription>Manage API keys for programmatic access</CardDescription>
              </div>
              <Button size="sm" className="bg-secondary hover:bg-secondary/90">
                <Plus className="h-4 w-4 mr-2" />
                Generate Key
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Production API Key</TableCell>
                    <TableCell className="font-mono text-sm">vv_prod_****...****a3f2</TableCell>
                    <TableCell className="text-muted-foreground">Jan 10, 2024</TableCell>
                    <TableCell className="text-muted-foreground">2 hours ago</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Development API Key</TableCell>
                    <TableCell className="font-mono text-sm">vv_dev_****...****b7c1</TableCell>
                    <TableCell className="text-muted-foreground">Dec 15, 2023</TableCell>
                    <TableCell className="text-muted-foreground">5 days ago</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Webhooks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Webhooks</CardTitle>
                <CardDescription>Configure webhooks for real-time event notifications</CardDescription>
              </div>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Webhook
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Plug className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No webhooks configured</p>
                <p className="text-sm">Add a webhook to receive real-time notifications</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Repository Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderArchive className="h-5 w-5" />
                Document Repository Settings
              </CardTitle>
              <CardDescription>Configure document storage and organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border bg-muted/30 text-center">
                  <p className="text-3xl font-bold text-foreground">1.2 GB</p>
                  <p className="text-sm text-muted-foreground">Storage Used</p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/30 text-center">
                  <p className="text-3xl font-bold text-foreground">5 GB</p>
                  <p className="text-sm text-muted-foreground">Storage Limit</p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/30 text-center">
                  <p className="text-3xl font-bold text-foreground">247</p>
                  <p className="text-sm text-muted-foreground">Total Documents</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Document Categories</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['SOC 2 Reports', 'ISO Certificates', 'Policies', 'Contracts', 'Audit Reports', 'Compliance Docs'].map((cat) => (
                    <div key={cat} className="flex items-center justify-between p-3 rounded-lg border">
                      <span>{cat}</span>
                      <Button variant="ghost" size="sm">Configure</Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Upload Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Maximum File Size</Label>
                      <p className="text-sm text-muted-foreground">Maximum size per uploaded file</p>
                    </div>
                    <Select defaultValue="50mb">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10mb">10 MB</SelectItem>
                        <SelectItem value="25mb">25 MB</SelectItem>
                        <SelectItem value="50mb">50 MB</SelectItem>
                        <SelectItem value="100mb">100 MB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allowed File Types</Label>
                      <p className="text-sm text-muted-foreground">PDF, DOCX, XLSX, PNG, JPG</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version Control */}
          <Card>
            <CardHeader>
              <CardTitle>Version Control</CardTitle>
              <CardDescription>Document versioning and history settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Version History</Label>
                  <p className="text-sm text-muted-foreground">Keep track of document versions</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Maximum Versions to Keep</Label>
                  <p className="text-sm text-muted-foreground">Number of versions to retain per document</p>
                </div>
                <Select defaultValue="10">
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="unlimited">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Retention Policies Tab */}
        <TabsContent value="retention" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Data Retention Policies
              </CardTitle>
              <CardDescription>Configure how long data is retained in the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label>Assessment Data Retention</Label>
                    <p className="text-sm text-muted-foreground">How long to keep completed assessments</p>
                  </div>
                  <Select 
                    value={retentionPolicies.assessmentRetention} 
                    onValueChange={(v) => setRetentionPolicies(p => ({ ...p, assessmentRetention: v }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1year">1 Year</SelectItem>
                      <SelectItem value="2years">2 Years</SelectItem>
                      <SelectItem value="3years">3 Years</SelectItem>
                      <SelectItem value="5years">5 Years</SelectItem>
                      <SelectItem value="7years">7 Years</SelectItem>
                      <SelectItem value="forever">Forever</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label>Document Retention</Label>
                    <p className="text-sm text-muted-foreground">How long to keep uploaded documents</p>
                  </div>
                  <Select 
                    value={retentionPolicies.documentRetention} 
                    onValueChange={(v) => setRetentionPolicies(p => ({ ...p, documentRetention: v }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1year">1 Year</SelectItem>
                      <SelectItem value="2years">2 Years</SelectItem>
                      <SelectItem value="3years">3 Years</SelectItem>
                      <SelectItem value="5years">5 Years</SelectItem>
                      <SelectItem value="7years">7 Years</SelectItem>
                      <SelectItem value="forever">Forever</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label>Activity Log Retention</Label>
                    <p className="text-sm text-muted-foreground">How long to keep activity logs</p>
                  </div>
                  <Select 
                    value={retentionPolicies.activityLogRetention} 
                    onValueChange={(v) => setRetentionPolicies(p => ({ ...p, activityLogRetention: v }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30days">30 Days</SelectItem>
                      <SelectItem value="90days">90 Days</SelectItem>
                      <SelectItem value="6months">6 Months</SelectItem>
                      <SelectItem value="1year">1 Year</SelectItem>
                      <SelectItem value="2years">2 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Automation Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
              <CardDescription>Configure automatic data management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoArchive">Auto-Archive Expired Documents</Label>
                  <p className="text-sm text-muted-foreground">Automatically archive documents past expiration</p>
                </div>
                <Switch
                  id="autoArchive"
                  checked={retentionPolicies.autoArchive}
                  onCheckedChange={(checked) => setRetentionPolicies(p => ({ ...p, autoArchive: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoDelete">Auto-Delete After Retention Period</Label>
                  <p className="text-sm text-muted-foreground">Permanently delete data after retention period ends</p>
                </div>
                <Switch
                  id="autoDelete"
                  checked={retentionPolicies.autoDelete}
                  onCheckedChange={(checked) => setRetentionPolicies(p => ({ ...p, autoDelete: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Requirements</CardTitle>
              <CardDescription>Retention settings based on regulatory requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'SOC 2', retention: '7 years' },
                  { name: 'GDPR', retention: 'As needed' },
                  { name: 'HIPAA', retention: '6 years' },
                  { name: 'PCI DSS', retention: '1 year' },
                  { name: 'ISO 27001', retention: '3 years' },
                  { name: 'CCPA', retention: '24 months' },
                ].map((compliance) => (
                  <div key={compliance.name} className="p-3 rounded-lg border bg-muted/30">
                    <p className="font-medium">{compliance.name}</p>
                    <p className="text-sm text-muted-foreground">Min: {compliance.retention}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveRetention} className="bg-secondary hover:bg-secondary/90">
              Save Retention Policies
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
