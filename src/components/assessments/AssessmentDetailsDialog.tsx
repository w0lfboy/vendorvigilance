import { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sparkles,
  Loader2,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  FileText,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Props {
  assessment: {
    id: string;
    title: string;
    status: string;
    due_date: string;
    vendor_id: string;
    access_token: string;
    score: number | null;
    risk_level: string | null;
  };
  vendorName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const riskColors: Record<string, string> = {
  low: 'text-success bg-success/10',
  medium: 'text-warning bg-warning/10',
  high: 'text-orange-500 bg-orange-500/10',
  critical: 'text-destructive bg-destructive/10',
};

export function AssessmentDetailsDialog({ assessment, vendorName, open, onOpenChange }: Props) {
  const { toast } = useToast();
  const { analysis, isLoading: analysisLoading, analyzeAssessment, isAnalyzing } = useAIAnalysis(assessment.id);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch responses count
  const { data: responsesData } = useQuery({
    queryKey: ['assessment-responses', assessment.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessment_responses')
        .select('*')
        .eq('assessment_id', assessment.id);
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const copyPortalLink = () => {
    const link = `${window.location.origin}/portal?token=${assessment.access_token}`;
    navigator.clipboard.writeText(link);
    toast({ title: 'Link copied', description: 'Portal link copied to clipboard' });
  };

  const handleAnalyze = () => {
    if (!responsesData || responsesData.length === 0) {
      toast({
        title: 'No responses',
        description: 'The vendor has not submitted any responses yet.',
        variant: 'destructive'
      });
      return;
    }
    analyzeAssessment(assessment.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{assessment.title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {vendorName} • Due: {format(new Date(assessment.due_date), 'MMM d, yyyy')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={copyPortalLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <a
                href={`${window.location.origin}/portal?token=${assessment.access_token}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Portal
                </Button>
              </a>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="responses">Responses</TabsTrigger>
            <TabsTrigger value="analysis">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Analysis
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="overview" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground">Status</div>
                    <Badge className="mt-1 capitalize">{assessment.status.replace('_', ' ')}</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground">Responses</div>
                    <div className="text-2xl font-bold mt-1">{responsesData?.length || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground">Score</div>
                    <div className="text-2xl font-bold mt-1">
                      {assessment.score !== null ? `${assessment.score}%` : '—'}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground">Risk Level</div>
                    {assessment.risk_level ? (
                      <Badge className={cn('mt-1 capitalize', riskColors[assessment.risk_level])}>
                        {assessment.risk_level}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </CardContent>
                </Card>
              </div>

              {analysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Executive Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{analysis.executive_summary}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="responses" className="mt-0">
              {!responsesData || responsesData.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">Awaiting Responses</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    The vendor hasn't submitted any responses yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {responsesData.map((response, idx) => (
                    <Card key={response.id}>
                      <CardContent className="py-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-medium">Question {idx + 1}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {response.response_text || 
                               (response.response_choice as { answer?: string })?.answer || 
                               JSON.stringify(response.response_choice)}
                            </p>
                          </div>
                          {response.is_flagged && (
                            <Badge variant="destructive" className="shrink-0">Flagged</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="mt-0 space-y-4">
              {!analysis && !analysisLoading ? (
                <div className="text-center py-12">
                  <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
                  <h3 className="font-semibold text-lg">AI-Powered Risk Analysis</h3>
                  <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
                    Analyze vendor responses using AI to identify risks, compliance gaps, and generate recommendations.
                  </p>
                  <Button 
                    className="mt-6 text-white" 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze with AI
                      </>
                    )}
                  </Button>
                </div>
              ) : analysisLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                  <p className="text-muted-foreground mt-4">Loading analysis...</p>
                </div>
              ) : analysis ? (
                <div className="space-y-6">
                  {/* Score Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Overall Score</p>
                            <p className="text-3xl font-bold mt-1">{analysis.overall_score}/100</p>
                          </div>
                          <div className={cn(
                            'h-12 w-12 rounded-full flex items-center justify-center',
                            riskColors[analysis.risk_level || 'medium']
                          )}>
                            {analysis.risk_level === 'low' && <CheckCircle2 className="h-6 w-6" />}
                            {analysis.risk_level === 'medium' && <AlertTriangle className="h-6 w-6" />}
                            {(analysis.risk_level === 'high' || analysis.risk_level === 'critical') && <XCircle className="h-6 w-6" />}
                          </div>
                        </div>
                        <Progress 
                          value={analysis.overall_score || 0} 
                          className="mt-3 h-2" 
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Risk Level</p>
                        <Badge className={cn('mt-2 capitalize text-sm', riskColors[analysis.risk_level || 'medium'])}>
                          {analysis.risk_level || 'Unknown'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                          Confidence: {Math.round((analysis.confidence_score || 0) * 100)}%
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Processing</p>
                        <p className="text-sm mt-2">
                          <span className="font-medium">{analysis.processing_time_ms}ms</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Model: {analysis.model_used}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Compliance Scores */}
                  {analysis.compliance_scores && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Compliance Alignment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          {Object.entries(analysis.compliance_scores).map(([framework, score]) => (
                            <div key={framework}>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>{framework}</span>
                                <span className="font-medium">{score}%</span>
                              </div>
                              <Progress value={score as number} className="h-2" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Strengths & Concerns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2 text-success">
                          <CheckCircle2 className="h-4 w-4" />
                          Key Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.key_strengths?.map((strength, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2 text-warning">
                          <AlertTriangle className="h-4 w-4" />
                          Key Concerns
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.key_concerns?.map((concern, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                              {concern}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recommended Actions */}
                  {analysis.recommended_actions && analysis.recommended_actions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Recommended Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analysis.recommended_actions.map((action, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  'shrink-0 capitalize',
                                  action.priority === 'critical' && 'border-destructive text-destructive',
                                  action.priority === 'high' && 'border-orange-500 text-orange-500',
                                  action.priority === 'medium' && 'border-warning text-warning',
                                  action.priority === 'low' && 'border-muted-foreground text-muted-foreground',
                                )}
                              >
                                {action.priority}
                              </Badge>
                              <div>
                                <p className="text-sm font-medium">{action.action}</p>
                                <p className="text-xs text-muted-foreground mt-1">{action.rationale}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Re-analyze button */}
                  <div className="flex justify-center">
                    <Button variant="outline" onClick={handleAnalyze} disabled={isAnalyzing}>
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Re-analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Re-analyze
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : null}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}