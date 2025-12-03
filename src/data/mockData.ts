export interface Vendor {
  id: string;
  name: string;
  website: string;
  category: string;
  riskScore: number;
  riskTier: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'pending' | 'offboarded';
  annualValue: number;
  lastAssessment: Date;
  nextAssessment: Date;
  openIssues: number;
  documentsCount: number;
  contactName: string;
  contactEmail: string;
}

export interface Assessment {
  id: string;
  vendorId: string;
  vendorName: string;
  templateName: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  score: number;
  dueDate: Date;
  completedDate?: Date;
}

export interface Document {
  id: string;
  vendorId: string;
  vendorName: string;
  name: string;
  type: 'soc2_report' | 'iso_certificate' | 'policy' | 'contract';
  uploadDate: Date;
  expirationDate?: Date;
  size: number;
  status: 'active' | 'expired' | 'expiring_soon';
}

export interface Activity {
  id: string;
  type: 'assessment_completed' | 'document_uploaded' | 'vendor_added' | 'risk_changed' | 'issue_created';
  title: string;
  description: string;
  timestamp: Date;
  user: {
    name: string;
    avatar?: string;
  };
  vendorName?: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: Date;
  assignee: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  vendorName: string;
  timestamp: Date;
}

// Generate mock vendors
export const vendors: Vendor[] = [
  { id: '1', name: 'CloudSecure Inc.', website: 'cloudsecure.io', category: 'Cloud Infrastructure', riskScore: 8.5, riskTier: 'critical', status: 'active', annualValue: 250000, lastAssessment: new Date('2024-01-15'), nextAssessment: new Date('2024-07-15'), openIssues: 5, documentsCount: 12, contactName: 'Sarah Chen', contactEmail: 'sarah@cloudsecure.io' },
  { id: '2', name: 'PayFlow Systems', website: 'payflow.com', category: 'Payment Processing', riskScore: 7.2, riskTier: 'high', status: 'active', annualValue: 180000, lastAssessment: new Date('2024-02-20'), nextAssessment: new Date('2024-08-20'), openIssues: 3, documentsCount: 8, contactName: 'Mike Johnson', contactEmail: 'mike@payflow.com' },
  { id: '3', name: 'DataVault Pro', website: 'datavault.co', category: 'Data Storage', riskScore: 4.8, riskTier: 'medium', status: 'active', annualValue: 95000, lastAssessment: new Date('2024-03-10'), nextAssessment: new Date('2024-09-10'), openIssues: 1, documentsCount: 15, contactName: 'Lisa Wong', contactEmail: 'lisa@datavault.co' },
  { id: '4', name: 'SecureAuth', website: 'secureauth.net', category: 'Identity Management', riskScore: 2.1, riskTier: 'low', status: 'active', annualValue: 45000, lastAssessment: new Date('2024-04-05'), nextAssessment: new Date('2024-10-05'), openIssues: 0, documentsCount: 20, contactName: 'Tom Davis', contactEmail: 'tom@secureauth.net' },
  { id: '5', name: 'LogiTech Partners', website: 'logitech-partners.com', category: 'Logistics', riskScore: 6.3, riskTier: 'high', status: 'pending', annualValue: 320000, lastAssessment: new Date('2024-01-28'), nextAssessment: new Date('2024-07-28'), openIssues: 4, documentsCount: 6, contactName: 'Anna Martinez', contactEmail: 'anna@logitech-partners.com' },
  { id: '6', name: 'CyberShield Corp', website: 'cybershield.io', category: 'Cybersecurity', riskScore: 3.4, riskTier: 'medium', status: 'active', annualValue: 150000, lastAssessment: new Date('2024-03-22'), nextAssessment: new Date('2024-09-22'), openIssues: 2, documentsCount: 18, contactName: 'James Lee', contactEmail: 'james@cybershield.io' },
  { id: '7', name: 'TechBase Solutions', website: 'techbase.dev', category: 'Software Development', riskScore: 5.7, riskTier: 'medium', status: 'active', annualValue: 200000, lastAssessment: new Date('2024-02-14'), nextAssessment: new Date('2024-08-14'), openIssues: 2, documentsCount: 10, contactName: 'Emily Brown', contactEmail: 'emily@techbase.dev' },
  { id: '8', name: 'GlobalNet Services', website: 'globalnet.com', category: 'Network Services', riskScore: 9.1, riskTier: 'critical', status: 'active', annualValue: 450000, lastAssessment: new Date('2024-01-05'), nextAssessment: new Date('2024-07-05'), openIssues: 8, documentsCount: 5, contactName: 'Robert Kim', contactEmail: 'robert@globalnet.com' },
];

export const assessments: Assessment[] = [
  { id: 'a1', vendorId: '1', vendorName: 'CloudSecure Inc.', templateName: 'SOC 2 Assessment', status: 'in_progress', progress: 65, score: 0, dueDate: new Date('2024-12-20') },
  { id: 'a2', vendorId: '2', vendorName: 'PayFlow Systems', templateName: 'PCI DSS Questionnaire', status: 'completed', progress: 100, score: 85, dueDate: new Date('2024-11-15'), completedDate: new Date('2024-11-10') },
  { id: 'a3', vendorId: '5', vendorName: 'LogiTech Partners', templateName: 'Security Assessment', status: 'not_started', progress: 0, score: 0, dueDate: new Date('2024-12-01') },
  { id: 'a4', vendorId: '8', vendorName: 'GlobalNet Services', templateName: 'Annual Review', status: 'in_progress', progress: 30, score: 0, dueDate: new Date('2024-12-05') },
];

export const documents: Document[] = [
  { id: 'd1', vendorId: '1', vendorName: 'CloudSecure Inc.', name: 'SOC 2 Type II Report 2024', type: 'soc2_report', uploadDate: new Date('2024-03-15'), expirationDate: new Date('2025-03-15'), size: 2500000, status: 'active' },
  { id: 'd2', vendorId: '2', vendorName: 'PayFlow Systems', name: 'PCI DSS Certificate', type: 'iso_certificate', uploadDate: new Date('2024-01-10'), expirationDate: new Date('2024-12-10'), size: 150000, status: 'expiring_soon' },
  { id: 'd3', vendorId: '4', vendorName: 'SecureAuth', name: 'ISO 27001 Certificate', type: 'iso_certificate', uploadDate: new Date('2024-02-20'), expirationDate: new Date('2027-02-20'), size: 180000, status: 'active' },
  { id: 'd4', vendorId: '3', vendorName: 'DataVault Pro', name: 'Data Processing Agreement', type: 'contract', uploadDate: new Date('2024-04-01'), size: 450000, status: 'active' },
];

export const activities: Activity[] = [
  { id: 'act1', type: 'assessment_completed', title: 'Assessment Completed', description: 'SOC 2 assessment completed with a score of 85%', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), user: { name: 'Sarah Chen' }, vendorName: 'PayFlow Systems' },
  { id: 'act2', type: 'document_uploaded', title: 'Document Uploaded', description: 'New SOC 2 Type II report uploaded', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), user: { name: 'Mike Johnson' }, vendorName: 'CloudSecure Inc.' },
  { id: 'act3', type: 'risk_changed', title: 'Risk Score Updated', description: 'Risk score increased from 7.5 to 9.1', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), user: { name: 'System' }, vendorName: 'GlobalNet Services' },
  { id: 'act4', type: 'vendor_added', title: 'New Vendor Added', description: 'TechBase Solutions has been added to the vendor list', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), user: { name: 'Emily Brown' } },
  { id: 'act5', type: 'issue_created', title: 'Issue Created', description: 'Missing encryption policy identified', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), user: { name: 'Tom Davis' }, vendorName: 'LogiTech Partners' },
];

export const tasks: Task[] = [
  { id: 't1', title: 'Review CloudSecure assessment responses', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), assignee: 'Sarah Chen', completed: false, priority: 'high' },
  { id: 't2', title: 'Follow up on PayFlow documentation', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), assignee: 'Mike Johnson', completed: false, priority: 'medium' },
  { id: 't3', title: 'Schedule GlobalNet security call', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), assignee: 'Emily Brown', completed: true, priority: 'high' },
  { id: 't4', title: 'Update DataVault contract terms', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), assignee: 'Tom Davis', completed: false, priority: 'low' },
];

export const alerts: Alert[] = [
  { id: 'al1', type: 'critical', title: 'Critical Risk Vendor', description: 'GlobalNet Services has exceeded risk threshold', vendorName: 'GlobalNet Services', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) },
  { id: 'al2', type: 'warning', title: 'Assessment Overdue', description: 'Security assessment is 5 days overdue', vendorName: 'LogiTech Partners', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
  { id: 'al3', type: 'warning', title: 'Document Expiring', description: 'PCI DSS Certificate expires in 7 days', vendorName: 'PayFlow Systems', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) },
];

// Dashboard stats
export const dashboardStats = {
  activeVendors: vendors.filter(v => v.status === 'active').length,
  overdueAssessments: 2,
  highRiskVendors: vendors.filter(v => v.riskTier === 'critical' || v.riskTier === 'high').length,
  recentCompletions: 5,
};

// Risk heat map data (5x5 grid)
export const riskHeatMapData = [
  { impact: 5, likelihood: 1, vendors: ['SecureAuth'] },
  { impact: 4, likelihood: 2, vendors: ['DataVault Pro'] },
  { impact: 3, likelihood: 3, vendors: ['CyberShield Corp', 'TechBase Solutions'] },
  { impact: 4, likelihood: 4, vendors: ['PayFlow Systems', 'LogiTech Partners'] },
  { impact: 5, likelihood: 4, vendors: ['CloudSecure Inc.'] },
  { impact: 5, likelihood: 5, vendors: ['GlobalNet Services'] },
];
