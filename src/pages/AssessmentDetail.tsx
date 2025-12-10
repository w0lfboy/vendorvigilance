import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Send,
  FileText,
  Download,
  RefreshCw,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Shield,
  TrendingUp,
  Flag,
  ExternalLink,
  Mail,
  Copy,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';

// Types
interface Assessment {
  id: string;
  title: string;
  status: string;
  due_date: string;
  submitted_date: string | null;
  reviewed_date: string | null;
  score: number | null;
  risk_level: string | null;
  access_token: string;
  is_recurring: boolean;
  recurrence_interval: string | null;
  created_at: string;
  vendor_id: string;
  template_id: string | null;
  ai_analyzed_at: string | null;
}

interface Vendor {
  id: string;
  name: string;
  category: string;
  contact_name: string | null;
  contact_email: string | null;
  risk_tier: string;
  annual_value: number | null;
}

interface Question {
  id: string;
  section: string;
  question_text: string;
  question_type: string;
  options: any;
  is_required: boolean;
  weight: number;
  order_index: number;
  help_text: string | null;
  compliance_mapping: any;
  risk_category: string | null;
}

interface Response {
  id: string;
  question_id: string;
  response_text: string | null;
  response_choice: any;
  file_path: string | null;
  is_flagged: boolean;
  reviewer_notes: string | null;
  ai_risk_flag: string | null;
  ai_analysis: string | null;
  ai_suggestions: any;
}

interface AIAnalysis {
  id: string;
  overall_score: number;
  risk_level: string;
  confidence_score: number;
  executive_summary: string;
  key_strengths: string[];
  key_concerns: string[];
  recommended_actions: Array<{
    action: string;
    priority: string;
    rationale: string;
  }>;
  compliance_scores: {
    SOC2?: number;
    ISO27001?: number;
    GDPR?: number;
  };
  findings: Array<{
    question_id: string;
    finding_type: string;
    summary: string;
    detail: string;
    compliance_impact: string[];
    recommended_action: string;
  }>;
  flagged_responses: string[];
  model_used: string;
  processing_time_ms: number;
  created_at: string;
}

// Status configuration
const statusConfig: Record<string, { label: string; icon: any; className: string; bgColor: string }> = {
  pending: { label: 'Pending', icon: Clock, className: 'text-muted-foreground', bgColor: 'bg-muted' },
  in_progress: { label: 'In Progress', icon: FileText, className: 'text-blue-600', bgColor: 'bg-blue-100' },
  submitted: { label: 'Submitted', icon: Send, className: 'text-amber-600', bgColor: 'bg-amber-100' },
  under_review: { label: 'Under Review', icon: AlertCircle, className: 'text-purple-600', bgColor: 'bg-purple-100' },
  completed: { label: 'Completed', icon: CheckCircle2, className: 'text-green-600', bgColor: 'bg-green-100' },
};

const riskLevelConfig: Record<string, { label: string; className: string; bgColor: string }> = {
  critical: { label: 'Critical', className: 'text-red-700', bgColor: 'bg-red-100' },
  high: { label: 'High', className: 'text-orange-700', bgColor: 'bg-orange-100' },
  medium: { label: 'Medium', className: 'text-amber-700', bgColor: 'bg-amber-100' },
  low: { label: 'Low', className: 'text-green-700', bgColor: 'bg-green-100' },
};

export default function AssessmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Map<string, Response>>(new Map());
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [reviewNotes, setReviewNotes] = useState('');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  // Load data
  useEffect(() => {
    if (id) {
      loadAssessmentData();
    }
  }, [id]);

  const loadAssessmentData = async () => {
    try {
      setLoading(true);

      // Fetch assessment
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('vendor_assessments')
        .select('*')
        .eq('id', id)
        .single();

      if (assessmentError) throw assessmentError;
      setAssessment(assessmentData);

      // Fetch vendor
      if (assessmentData.vendor_id) {
        const { data: vendorData } = await supabase
          .from('vendors')
          .select('*')
          .eq('id', assessmentData.vendor_id)
          .single();
        setVendor(vendorData);
      }

      // Fetch questions from template
      if (assessmentData.template_id) {
        const { data: questionsData } = await supabase
          .from('questionnaire_questions')
          .select('*')
          .eq('template_id', assessmentData.template_id)
          .order('order_index');
        setQuestions(questionsData || []);

        // Expand all sections by default
        const sections = new Set(questionsData?.map(q => q.section) || []);
        setExpandedSections(sections);
      }

      // Fetch responses
      const { data: responsesData } = await supabase
        .from('assessment_responses')
        .select('*')
        .eq('assessment_id', id);

      if (responsesData) {
        const responseMap = new Map<string, Response>();
        responsesData.forEach(r => responseMap.set(r.question_id, r));
        setResponses(responseMap);
      }

      // Fetch AI analysis
      const { data: analysisData } = await supabase
        .from('assessment_ai_analysis')
        .select('*')
        .eq('assessment_id', id)
        .single();

      if (analysisData) {
        setAIAnalysis({
          id: analysisData.id,
          overall_score: analysisData.overall_score || 0,
          risk_level: analysisData.risk_level || 'medium',
          confidence_score: analysisData.confidence_score || 0,
          executive_summary: analysisData.executive_summary || '',
          key_strengths: (analysisData.key_strengths as string[]) || [],
          key_concerns: (analysisData.key_concerns as string[]) || [],
          recommended_actions: (analysisData.recommended_actions as AIAnalysis['recommended_actions']) || [],
          compliance_scores: (analysisData.compliance_scores as AIAnalysis['compliance_scores']) || {},
          findings: (analysisData.findings as AIAnalysis['findings']) || [],
          flagged_responses: (analysisData.flagged_responses as string[]) || [],
          model_used: analysisData.model_used || 'unknown',
          processing_time_ms: analysisData.processing_time_ms || 0,
          created_at: analysisData.created_at,
        });
      }

    } catch (error) {
      console.error('Error loading assessment:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assessment data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Run AI analysis
  const runAIAnalysis = async () => {
    if (!assessment) return;

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-assessment', {
        body: { assessment_id: assessment.id },
      });

      if (error) throw error;

      toast({
        title: 'Analysis Complete',
        description: `Risk score: ${data.analysis.overall_score}/100 (${data.analysis.risk_level})`,
      });

      // Reload data to get updated analysis
      await loadAssessmentData();
    } catch (error) {
      console.error('AI analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not complete AI analysis. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Send reminder email
  const sendReminder = async () => {
    if (!assessment || !vendor) return;

    setSendingReminder(true);
    try {
      const { error } = await supabase.functions.invoke('send-notification', {
        body: {
          type: 'assessment_reminder',
          assessment_id: assessment.id,
          vendor_id: vendor.id,
        },
      });

      if (error) throw error;

      toast({
        title: 'Reminder Sent',
        description: `Reminder email sent to ${vendor.contact_email}`,
      });
    } catch (error) {
      console.error('Send reminder error:', error);
      toast({
        title: 'Failed to Send',
        description: 'Could not send reminder email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSendingReminder(false);
    }
  };

  // Update assessment status
  const updateStatus = async (newStatus: string) => {
    if (!assessment) return;

    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'completed') {
        updates.reviewed_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('vendor_assessments')
        .update(updates)
        .eq('id', assessment.id);

      if (error) throw error;

      setAssessment(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: 'Status Updated',
        description: `Assessment marked as ${statusConfig[newStatus]?.label || newStatus}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  // Copy vendor portal link
  const copyPortalLink = () => {
    if (!assessment) return;
    const link = `${window.location.origin}/vendor-portal?token=${assessment.access_token}`;
    navigator.clipboard.writeText(link);
    toast({ title: 'Link Copied', description: 'Vendor portal link copied to clipboard' });
  };

  // Group questions by section
  const questionsBySection = questions.reduce((acc, q) => {
    if (!acc[q.section]) acc[q.section] = [];
    acc[q.section].push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  // Calculate progress
  const answeredCount = Array.from(responses.values()).filter(
    r => r.response_text || r.response_choice
  ).length;
  const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  // Format response for display
  const formatResponse = (question: Question, response: Response | undefined) => {
    if (!response) return <span className="text-muted-foreground italic">No response</span>;

    if (response.response_choice) {
      const choice = response.response_choice;
      if (typeof choice === 'object' && choice.answer) {
        return choice.answer;
      }
      if (Array.isArray(choice)) {
        return choice.join(', ');
      }
      return JSON.stringify(choice);
    }

    if (response.response_text) {
      return response.response_text;
    }

    if (response.file_path) {
      return (
        <a href={response.file_path} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
          <FileText className="h-4 w-4" />
          View uploaded file
        </a>
      );
    }

    return <span className="text-muted-foreground italic">No response</span>;
  };

  // Get finding for a question
  const getFinding = (questionId: string) => {
    return aiAnalysis?.findings?.find(f => f.question_id === questionId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Assessment Not Found</h2>
        <p className="text-muted-foreground mb-4">The assessment you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/assessments')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assessments
        </Button>
      </div>
    );
  }

  const status = statusConfig[assessment.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const isOverdue = new Date(assessment.due_date) < new Date() && assessment.status !== 'completed';
  const canAnalyze = assessment.status === 'submitted' || assessment.status === 'under_review';
  const canApprove = assessment.status === 'submitted' || assessment.status === 'under_review';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/assessments" className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Assessments
            </Link>
            <span>/</span>
            <span>{assessment.title}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{assessment.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge className={cn('gap-1', status.bgColor, status.className)}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Overdue
              </Badge>
            )}
            {assessment.risk_level && (
              <Badge className={cn('gap-1', riskLevelConfig[assessment.risk_level]?.bgColor, riskLevelConfig[assessment.risk_level]?.className)}>
                <Shield className="h-3 w-3" />
                {riskLevelConfig[assessment.risk_level]?.label} Risk
              </Badge>
            )}
            {assessment.score !== null && (
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                Score: {assessment.score}/100
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canAnalyze && (
            <Button
              variant="outline"
              onClick={runAIAnalysis}
              disabled={analyzing}
            >
              {analyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {aiAnalysis ? 'Re-analyze' : 'Run AI Analysis'}
                </>
              )}
            </Button>
          )}

          {canApprove && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(true)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Request Changes
              </Button>
              <Button
                onClick={() => setShowApproveDialog(true)}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={copyPortalLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Portal Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={sendReminder} disabled={sendingReminder}>
                <Mail className="h-4 w-4 mr-2" />
                Send Reminder
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Vendor Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vendor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <Link to={`/vendors/${vendor?.id}`} className="font-medium hover:underline">
                {vendor?.name || 'Unknown'}
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{vendor?.category}</p>
          </CardContent>
        </Card>

        {/* Due Date */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Due Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className={cn('h-4 w-4', isOverdue ? 'text-destructive' : 'text-muted-foreground')} />
              <span className={cn('font-medium', isOverdue && 'text-destructive')}>
                {format(new Date(assessment.due_date), 'MMM d, yyyy')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(assessment.due_date), { addSuffix: true })}
            </p>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{progress}%</span>
              <span className="text-sm text-muted-foreground">
                {answeredCount}/{questions.length} questions
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* AI Score */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            {aiAnalysis ? (
              <>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">{aiAnalysis.overall_score}</span>
                  <span className="text-muted-foreground">/100</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Confidence: {Math.round(aiAnalysis.confidence_score * 100)}%
                </p>
              </>
            ) : (
              <div className="text-muted-foreground">
                <p className="text-sm">Not analyzed yet</p>
                {canAnalyze && (
                  <Button variant="link" className="p-0 h-auto text-sm" onClick={runAIAnalysis}>
                    Run analysis →
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="responses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="responses" className="gap-2">
            <FileText className="h-4 w-4" />
            Responses ({answeredCount}/{questions.length})
          </TabsTrigger>
          <TabsTrigger value="analysis" className="gap-2" disabled={!aiAnalysis}>
            <Sparkles className="h-4 w-4" />
            AI Analysis
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <Clock className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        {/* Responses Tab */}
        <TabsContent value="responses" className="space-y-4">
          {Object.entries(questionsBySection).map(([section, sectionQuestions]) => {
            const isExpanded = expandedSections.has(section);
            const sectionAnswered = sectionQuestions.filter(q => {
              const r = responses.get(q.id);
              return r && (r.response_text || r.response_choice);
            }).length;
            const sectionFlagged = sectionQuestions.filter(q => {
              const r = responses.get(q.id);
              return r?.is_flagged || r?.ai_risk_flag;
            }).length;

            return (
              <Collapsible
                key={section}
                open={isExpanded}
                onOpenChange={(open) => {
                  const newSet = new Set(expandedSections);
                  if (open) {
                    newSet.add(section);
                  } else {
                    newSet.delete(section);
                  }
                  setExpandedSections(newSet);
                }}
              >
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <CardTitle className="text-base">{section}</CardTitle>
                          <Badge variant="secondary">
                            {sectionAnswered}/{sectionQuestions.length}
                          </Badge>
                          {sectionFlagged > 0 && (
                            <Badge variant="destructive" className="gap-1">
                              <Flag className="h-3 w-3" />
                              {sectionFlagged} flagged
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {sectionQuestions.map((question, idx) => {
                          const response = responses.get(question.id);
                          const finding = getFinding(question.id);
                          const isFlagged = response?.is_flagged || response?.ai_risk_flag;

                          return (
                            <div
                              key={question.id}
                              className={cn(
                                'p-4 rounded-lg border',
                                isFlagged ? 'border-destructive/50 bg-destructive/5' : 'border-border'
                              )}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-start gap-2">
                                    <span className="text-sm text-muted-foreground font-medium">
                                      {idx + 1}.
                                    </span>
                                    <div className="flex-1">
                                      <p className="font-medium">
                                        {question.question_text}
                                        {question.is_required && (
                                          <span className="text-destructive ml-1">*</span>
                                        )}
                                      </p>
                                      {question.help_text && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {question.help_text}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Response */}
                                  <div className="mt-3 ml-6 p-3 bg-muted/50 rounded-md">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Response:</p>
                                    <div className="text-sm">{formatResponse(question, response)}</div>
                                  </div>

                                  {/* AI Finding */}
                                  {finding && (
                                    <div className={cn(
                                      'mt-3 ml-6 p-3 rounded-md border-l-4',
                                      finding.finding_type === 'critical_gap' && 'bg-red-50 border-red-500',
                                      finding.finding_type === 'concern' && 'bg-amber-50 border-amber-500',
                                      finding.finding_type === 'needs_clarification' && 'bg-blue-50 border-blue-500',
                                      finding.finding_type === 'strength' && 'bg-green-50 border-green-500',
                                    )}>
                                      <div className="flex items-center gap-2 mb-1">
                                        <Sparkles className="h-3 w-3" />
                                        <span className="text-xs font-medium uppercase">
                                          AI {finding.finding_type.replace('_', ' ')}
                                        </span>
                                      </div>
                                      <p className="text-sm">{finding.detail}</p>
                                      {finding.recommended_action && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                          <strong>Recommendation:</strong> {finding.recommended_action}
                                        </p>
                                      )}
                                    </div>
                                  )}

                                  {/* Compliance Mapping */}
                                  {question.compliance_mapping && (
                                    <div className="mt-2 ml-6 flex gap-1 flex-wrap">
                                      {Object.entries(question.compliance_mapping).map(([framework, controls]) => (
                                        <TooltipProvider key={framework}>
                                          <Tooltip>
                                            <TooltipTrigger>
                                              <Badge variant="outline" className="text-xs">
                                                {framework}
                                              </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              {(controls as string[]).join(', ')}
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Flag indicator */}
                                <div className="flex items-center gap-2">
                                  {response?.ai_risk_flag && (
                                    <Badge
                                      className={cn(
                                        riskLevelConfig[response.ai_risk_flag]?.bgColor,
                                        riskLevelConfig[response.ai_risk_flag]?.className
                                      )}
                                    >
                                      {riskLevelConfig[response.ai_risk_flag]?.label}
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    Weight: {question.weight}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          {aiAnalysis ? (
            <>
              {/* Executive Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{aiAnalysis.executive_summary}</p>

                  {/* Compliance Scores */}
                  {aiAnalysis.compliance_scores && (
                    <div className="mt-6 grid grid-cols-3 gap-4">
                      {Object.entries(aiAnalysis.compliance_scores).map(([framework, score]) => (
                        <div key={framework} className="text-center p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">{framework}</p>
                          <p className="text-2xl font-bold">{score}%</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Strengths & Concerns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Key Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {aiAnalysis.key_strengths?.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-amber-700">
                      <AlertTriangle className="h-4 w-4" />
                      Key Concerns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {aiAnalysis.key_concerns?.map((concern, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Recommended Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recommended Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiAnalysis.recommended_actions?.map((action, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          'p-3 rounded-lg border-l-4',
                          action.priority === 'critical' && 'bg-red-50 border-red-500',
                          action.priority === 'high' && 'bg-orange-50 border-orange-500',
                          action.priority === 'medium' && 'bg-amber-50 border-amber-500',
                          action.priority === 'low' && 'bg-green-50 border-green-500',
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{action.action}</span>
                          <Badge
                            className={cn(
                              riskLevelConfig[action.priority]?.bgColor,
                              riskLevelConfig[action.priority]?.className
                            )}
                          >
                            {action.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{action.rationale}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Metadata */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Analyzed {format(new Date(aiAnalysis.created_at), 'MMM d, yyyy h:mm a')}
                    </span>
                    <span>Model: {aiAnalysis.model_used}</span>
                    <span>Processing time: {aiAnalysis.processing_time_ms}ms</span>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No AI Analysis Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Run AI analysis to get risk scores, findings, and recommendations.
                </p>
                {canAnalyze && (
                  <Button onClick={runAIAnalysis} disabled={analyzing}>
                    {analyzing ? 'Analyzing...' : 'Run AI Analysis'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TimelineItem
                  title="Assessment Created"
                  date={assessment.created_at}
                  icon={FileText}
                  completed
                />
                {assessment.status !== 'pending' && (
                  <TimelineItem
                    title="Vendor Started"
                    date={assessment.created_at}
                    icon={Clock}
                    completed
                  />
                )}
                {assessment.submitted_date && (
                  <TimelineItem
                    title="Submitted by Vendor"
                    date={assessment.submitted_date}
                    icon={Send}
                    completed
                  />
                )}
                {assessment.ai_analyzed_at && (
                  <TimelineItem
                    title="AI Analysis Completed"
                    date={assessment.ai_analyzed_at}
                    icon={Sparkles}
                    completed
                  />
                )}
                {assessment.reviewed_date && (
                  <TimelineItem
                    title="Review Completed"
                    date={assessment.reviewed_date}
                    icon={CheckCircle2}
                    completed
                  />
                )}
                {assessment.status !== 'completed' && (
                  <TimelineItem
                    title="Due Date"
                    date={assessment.due_date}
                    icon={Calendar}
                    completed={false}
                    isOverdue={isOverdue}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Assessment</DialogTitle>
            <DialogDescription>
              Mark this assessment as complete and approved. The vendor's risk profile will be updated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Review Notes (optional)</label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add any notes about this review..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              updateStatus('completed');
              setShowApproveDialog(false);
            }}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject/Request Changes Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Send the assessment back to the vendor with feedback on what needs to be updated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Feedback for Vendor *</label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Explain what changes are needed..."
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                updateStatus('in_progress');
                setShowRejectDialog(false);
                // TODO: Send notification to vendor
              }}
              disabled={!reviewNotes.trim()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Request Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Timeline Item Component
function TimelineItem({
  title,
  date,
  icon: Icon,
  completed,
  isOverdue = false,
}: {
  title: string;
  date: string;
  icon: any;
  completed: boolean;
  isOverdue?: boolean;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
          completed ? 'bg-primary text-primary-foreground' : isOverdue ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground'
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 pt-1">
        <p className={cn('font-medium', isOverdue && 'text-destructive')}>{title}</p>
        <p className="text-sm text-muted-foreground">
          {format(new Date(date), 'MMM d, yyyy h:mm a')}
        </p>
      </div>
    </div>
  );
}
