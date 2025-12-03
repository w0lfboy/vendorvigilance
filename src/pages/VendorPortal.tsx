import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Shield, CheckCircle2, AlertCircle, Send, Save, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  section: string;
  question_text: string;
  question_type: string;
  options: string[] | null;
  is_required: boolean;
  order_index: number;
}

interface Assessment {
  id: string;
  title: string;
  due_date: string;
  status: string;
  vendor_id: string;
}

export default function VendorPortal() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { toast } = useToast();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sections = [...new Set(questions.map(q => q.section))];
  const currentQuestions = questions.filter(q => q.section === sections[currentSection]);
  const answeredCount = Object.keys(responses).filter(k => responses[k] && responses[k] !== '').length;
  const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  useEffect(() => {
    if (token) {
      loadAssessment();
    }
  }, [token]);

  const loadAssessment = async () => {
    try {
      // Get assessment by access token
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('vendor_assessments')
        .select('*')
        .eq('access_token', token)
        .single();

      if (assessmentError || !assessmentData) {
        setError('Invalid or expired assessment link');
        setLoading(false);
        return;
      }

      setAssessment(assessmentData);

      // Load questions from template
      if (assessmentData.template_id) {
        const { data: questionsData } = await supabase
          .from('questionnaire_questions')
          .select('*')
          .eq('template_id', assessmentData.template_id)
          .order('order_index');

        if (questionsData) {
          setQuestions(questionsData.map(q => ({
            ...q,
            options: q.options as string[] | null
          })));
        }
      }

      // Load existing responses
      const { data: responsesData } = await supabase
        .from('assessment_responses')
        .select('*')
        .eq('assessment_id', assessmentData.id);

      if (responsesData) {
        const responseMap: Record<string, any> = {};
        responsesData.forEach(r => {
          responseMap[r.question_id] = r.response_text || r.response_choice;
        });
        setResponses(responseMap);
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to load assessment');
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const saveProgress = async () => {
    if (!assessment) return;
    setSaving(true);

    try {
      for (const [questionId, response] of Object.entries(responses)) {
        const responseData: any = {
          assessment_id: assessment.id,
          question_id: questionId,
        };

        if (typeof response === 'string') {
          responseData.response_text = response;
        } else {
          responseData.response_choice = response;
        }

        await supabase
          .from('assessment_responses')
          .upsert(responseData, { onConflict: 'assessment_id,question_id' });
      }

      toast({ title: 'Progress saved', description: 'Your responses have been saved.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save progress', variant: 'destructive' });
    }

    setSaving(false);
  };

  const submitAssessment = async () => {
    if (!assessment) return;

    // Check required questions
    const unansweredRequired = questions
      .filter(q => q.is_required)
      .filter(q => !responses[q.id] || responses[q.id] === '');

    if (unansweredRequired.length > 0) {
      toast({
        title: 'Missing required answers',
        description: `Please answer all required questions (${unansweredRequired.length} remaining)`,
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    await saveProgress();

    // Update assessment status
    await supabase
      .from('vendor_assessments')
      .update({ status: 'submitted', submitted_date: new Date().toISOString() })
      .eq('id', assessment.id);

    setAssessment(prev => prev ? { ...prev, status: 'submitted' } : null);
    toast({ title: 'Assessment submitted', description: 'Thank you for completing the assessment.' });
    setSaving(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-destructive mb-4" />
            <CardTitle>Access Required</CardTitle>
            <CardDescription>
              Please use the assessment link provided in your email to access this questionnaire.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (assessment?.status === 'submitted' || assessment?.status === 'completed') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-success mb-4" />
            <CardTitle>Assessment Submitted</CardTitle>
            <CardDescription>
              Thank you for completing this assessment. The requesting organization will review your responses.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="font-semibold text-foreground">{assessment?.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Due: {assessment?.due_date ? new Date(assessment.due_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={saveProgress} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Save Progress
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">{answeredCount} of {questions.length} questions answered</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      {/* Section Navigation */}
      <div className="border-b bg-muted/30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {sections.map((section, idx) => {
              const sectionQuestions = questions.filter(q => q.section === section);
              const sectionAnswered = sectionQuestions.filter(q => responses[q.id] && responses[q.id] !== '').length;
              const isComplete = sectionAnswered === sectionQuestions.length;
              
              return (
                <button
                  key={section}
                  onClick={() => setCurrentSection(idx)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    idx === currentSection
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isComplete && <CheckCircle2 className="h-4 w-4" />}
                    {section}
                    <Badge variant="secondary" className="text-xs">
                      {sectionAnswered}/{sectionQuestions.length}
                    </Badge>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Questions */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {currentQuestions.map((question, idx) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="text-muted-foreground">{idx + 1}.</span>
                      {question.question_text}
                      {question.is_required && <span className="text-destructive">*</span>}
                    </CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {question.question_type === 'text' && (
                  <Textarea
                    placeholder="Enter your response..."
                    value={responses[question.id] || ''}
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    className="min-h-[120px]"
                  />
                )}

                {question.question_type === 'single_choice' && question.options && (
                  <RadioGroup
                    value={responses[question.id] || ''}
                    onValueChange={(value) => handleResponseChange(question.id, value)}
                  >
                    {question.options.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                        <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {question.question_type === 'multiple_choice' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option) => {
                      const currentValue = responses[question.id] || [];
                      const isChecked = Array.isArray(currentValue) && currentValue.includes(option);
                      
                      return (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${question.id}-${option}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleResponseChange(question.id, [...currentValue, option]);
                              } else {
                                handleResponseChange(question.id, currentValue.filter((v: string) => v !== option));
                              }
                            }}
                          />
                          <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentSection(prev => prev - 1)}
            disabled={currentSection === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous Section
          </Button>

          {currentSection === sections.length - 1 ? (
            <Button onClick={submitAssessment} disabled={saving}>
              <Send className="h-4 w-4 mr-2" />
              Submit Assessment
            </Button>
          ) : (
            <Button onClick={() => setCurrentSection(prev => prev + 1)}>
              Next Section
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
