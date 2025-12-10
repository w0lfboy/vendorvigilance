import { Brain, Loader2, Play, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePendingAnalysis } from '@/hooks/usePendingAnalysis';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

export function PendingAnalysisWidget() {
  const { pendingAssessments, isLoading, analyzeAssessment, isAnalyzing, bulkAnalyze, isBulkAnalyzing } = usePendingAnalysis();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === pendingAssessments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingAssessments.map(a => a.id));
    }
  };

  const handleSingleAnalyze = async (id: string) => {
    setAnalyzingId(id);
    try {
      await analyzeAssessment(id);
      setSelectedIds(prev => prev.filter(i => i !== id));
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleBulkAnalyze = () => {
    if (selectedIds.length > 0) {
      bulkAnalyze(selectedIds);
      setSelectedIds([]);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            Pending AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (pendingAssessments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            Pending AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Sparkles className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">All assessments have been analyzed</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            Pending AI Analysis
            <Badge variant="secondary" className="ml-2">
              {pendingAssessments.length}
            </Badge>
          </CardTitle>
          {selectedIds.length > 0 && (
            <Button 
              size="sm" 
              onClick={handleBulkAnalyze}
              disabled={isBulkAnalyzing}
            >
              {isBulkAnalyzing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Analyze {selectedIds.length}
            </Button>
          )}
        </div>
        {pendingAssessments.length > 1 && (
          <div className="flex items-center gap-2 pt-2">
            <Checkbox 
              checked={selectedIds.length === pendingAssessments.length}
              onCheckedChange={toggleAll}
              id="select-all"
            />
            <label htmlFor="select-all" className="text-sm text-muted-foreground cursor-pointer">
              Select all
            </label>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[280px] pr-4">
          <div className="space-y-3">
            {pendingAssessments.map((assessment) => (
              <div 
                key={assessment.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <Checkbox 
                  checked={selectedIds.includes(assessment.id)}
                  onCheckedChange={() => toggleSelection(assessment.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{assessment.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {assessment.vendor.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {assessment.response_count} responses
                    </Badge>
                    {assessment.submitted_date && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(assessment.submitted_date), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleSingleAnalyze(assessment.id)}
                  disabled={isAnalyzing || analyzingId === assessment.id}
                >
                  {analyzingId === assessment.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
