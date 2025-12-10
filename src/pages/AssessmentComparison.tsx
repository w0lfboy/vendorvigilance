import { useState, useMemo } from 'react';
import { ArrowLeft, Scale, Shield, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAssessments } from '@/hooks/useAssessments';
import { useVendors } from '@/hooks/useVendors';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface AIAnalysis {
  id: string;
  assessment_id: string;
  overall_score: number | null;
  risk_level: string | null;
  confidence_score: number | null;
  executive_summary: string | null;
  key_strengths: string[] | null;
  key_concerns: string[] | null;
  compliance_scores: {
    SOC2?: number;
    ISO27001?: number;
    GDPR?: number;
  } | null;
}

function useMultipleAIAnalysis(assessmentIds: string[]) {
  return useQuery({
    queryKey: ['ai-analysis-multiple', assessmentIds],
    queryFn: async () => {
      if (assessmentIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('assessment_ai_analysis')
        .select('*')
        .in('assessment_id', assessmentIds);
      
      if (error) throw error;
      return data as unknown as AIAnalysis[];
    },
    enabled: assessmentIds.length > 0,
  });
}

export default function AssessmentComparison() {
  const navigate = useNavigate();
  const { assessments } = useAssessments();
  const { vendors } = useVendors();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Filter to only show completed assessments with AI analysis
  const completedAssessments = assessments.filter(a => 
    a.status === 'completed' || a.status === 'under_review' || a.status === 'submitted'
  );
  
  const { data: analyses, isLoading: isLoadingAnalyses } = useMultipleAIAnalysis(selectedIds);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id)
        : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const selectedAssessments = useMemo(() => 
    completedAssessments.filter(a => selectedIds.includes(a.id)),
    [completedAssessments, selectedIds]
  );

  const getVendorName = (vendorId: string) => 
    vendors.find(v => v.id === vendorId)?.name || 'Unknown Vendor';

  const getAnalysis = (assessmentId: string) => 
    analyses?.find(a => a.assessment_id === assessmentId);

  const getRiskColor = (level: string | null | undefined) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-amber-500';
      case 'medium': return 'text-blue-500';
      case 'low': return 'text-emerald-500';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBadgeVariant = (level: string | null | undefined): 'destructive' | 'default' | 'secondary' | 'outline' => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            Assessment Comparison
          </h1>
          <p className="text-muted-foreground">Compare AI analysis results across vendors side-by-side</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Selection Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Select Assessments</CardTitle>
            <CardDescription>Choose up to 4 assessments to compare</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {completedAssessments.map(assessment => (
                  <div 
                    key={assessment.id}
                    className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${
                      selectedIds.includes(assessment.id) 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-muted border-border'
                    }`}
                    onClick={() => toggleSelection(assessment.id)}
                  >
                    <Checkbox 
                      checked={selectedIds.includes(assessment.id)}
                      disabled={!selectedIds.includes(assessment.id) && selectedIds.length >= 4}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{getVendorName(assessment.vendor_id)}</p>
                      <p className="text-xs text-muted-foreground truncate">{assessment.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {assessment.status}
                        </Badge>
                        {assessment.score && (
                          <span className="text-xs text-muted-foreground">Score: {assessment.score}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {completedAssessments.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No assessments available for comparison</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Comparison Grid */}
        <div className="lg:col-span-3">
          {selectedIds.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Scale className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Select assessments from the left panel to compare their AI analysis results
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Score Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Overall Risk Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`grid gap-4 ${
                    selectedIds.length === 1 ? 'grid-cols-1' :
                    selectedIds.length === 2 ? 'grid-cols-2' :
                    selectedIds.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
                  }`}>
                    {selectedAssessments.map(assessment => {
                      const analysis = getAnalysis(assessment.id);
                      return (
                        <div key={assessment.id} className="text-center p-4 bg-muted/50 rounded">
                          <p className="font-medium text-sm truncate mb-2">{getVendorName(assessment.vendor_id)}</p>
                          <div className="text-4xl font-bold mb-2">
                            {analysis?.overall_score ?? 'N/A'}
                          </div>
                          {analysis?.risk_level && (
                            <Badge variant={getRiskBadgeVariant(analysis.risk_level)}>
                              {analysis.risk_level.toUpperCase()}
                            </Badge>
                          )}
                          {analysis?.confidence_score && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Confidence: {Math.round(analysis.confidence_score * 100)}%
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Scores */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Compliance Framework Scores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['SOC2', 'ISO27001', 'GDPR'].map(framework => (
                      <div key={framework}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{framework}</span>
                        </div>
                        <div className={`grid gap-4 ${
                          selectedIds.length === 1 ? 'grid-cols-1' :
                          selectedIds.length === 2 ? 'grid-cols-2' :
                          selectedIds.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
                        }`}>
                          {selectedAssessments.map(assessment => {
                            const analysis = getAnalysis(assessment.id);
                            const score = analysis?.compliance_scores?.[framework as keyof typeof analysis.compliance_scores];
                            return (
                              <div key={assessment.id} className="space-y-1">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span className="truncate">{getVendorName(assessment.vendor_id)}</span>
                                  <span>{score ?? '-'}%</span>
                                </div>
                                <Progress value={score ?? 0} className="h-2" />
                              </div>
                            );
                          })}
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Key Strengths & Concerns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strengths */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Key Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedAssessments.map(assessment => {
                        const analysis = getAnalysis(assessment.id);
                        return (
                          <div key={assessment.id} className="space-y-2">
                            <p className="font-medium text-sm text-primary">{getVendorName(assessment.vendor_id)}</p>
                            {analysis?.key_strengths?.length ? (
                              <ul className="space-y-1">
                                {analysis.key_strengths.slice(0, 3).map((strength, i) => (
                                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-1 shrink-0" />
                                    <span>{strength}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-muted-foreground">No analysis available</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Concerns */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Key Concerns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedAssessments.map(assessment => {
                        const analysis = getAnalysis(assessment.id);
                        return (
                          <div key={assessment.id} className="space-y-2">
                            <p className="font-medium text-sm text-primary">{getVendorName(assessment.vendor_id)}</p>
                            {analysis?.key_concerns?.length ? (
                              <ul className="space-y-1">
                                {analysis.key_concerns.slice(0, 3).map((concern, i) => (
                                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <XCircle className="h-3 w-3 text-amber-500 mt-1 shrink-0" />
                                    <span>{concern}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-muted-foreground">No analysis available</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Executive Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Executive Summaries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`grid gap-4 ${
                    selectedIds.length === 1 ? 'grid-cols-1' :
                    selectedIds.length === 2 ? 'grid-cols-2' :
                    selectedIds.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
                  }`}>
                    {selectedAssessments.map(assessment => {
                      const analysis = getAnalysis(assessment.id);
                      return (
                        <div key={assessment.id} className="p-4 bg-muted/30 rounded">
                          <p className="font-medium text-sm text-primary mb-2">{getVendorName(assessment.vendor_id)}</p>
                          <p className="text-sm text-muted-foreground">
                            {analysis?.executive_summary || 'No executive summary available. Run AI analysis to generate.'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
