import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Eye,
  Copy,
  Settings2,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  CheckSquare,
  List,
  AlignLeft,
  Upload,
  Calendar,
  Hash,
  ToggleLeft,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import TemplateStarterModal from '@/components/TemplateStarterModal';

// Types
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
  isNew?: boolean;
  isModified?: boolean;
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  framework: string | null;
  is_active: boolean;
}

// Question type configuration
const questionTypes = [
  { value: 'yes_no', label: 'Yes / No', icon: ToggleLeft, description: 'Simple yes or no answer' },
  { value: 'yes_no_na', label: 'Yes / No / N/A', icon: CheckSquare, description: 'Yes, No, or Not Applicable' },
  { value: 'single_choice', label: 'Single Choice', icon: List, description: 'Select one option from a list' },
  { value: 'multi_choice', label: 'Multiple Choice', icon: CheckSquare, description: 'Select multiple options' },
  { value: 'text_short', label: 'Short Text', icon: AlignLeft, description: 'Brief text response (1-2 sentences)' },
  { value: 'text_long', label: 'Long Text', icon: FileText, description: 'Detailed text response (paragraph)' },
  { value: 'file_upload', label: 'File Upload', icon: Upload, description: 'Upload a document' },
  { value: 'date', label: 'Date', icon: Calendar, description: 'Select a date' },
  { value: 'number', label: 'Number', icon: Hash, description: 'Numeric input' },
];

// Risk categories
const riskCategories = [
  { value: 'governance', label: 'Security Governance' },
  { value: 'access_control', label: 'Access Control' },
  { value: 'data_protection', label: 'Data Protection' },
  { value: 'incident_response', label: 'Incident Response' },
  { value: 'compliance', label: 'Compliance & Audits' },
  { value: 'business_continuity', label: 'Business Continuity' },
  { value: 'network_security', label: 'Network Security' },
  { value: 'application_security', label: 'Application Security' },
  { value: 'physical_security', label: 'Physical Security' },
  { value: 'hr_security', label: 'HR Security' },
];

// Compliance frameworks
const complianceFrameworks = [
  { value: 'SOC2', label: 'SOC 2' },
  { value: 'ISO27001', label: 'ISO 27001' },
  { value: 'GDPR', label: 'GDPR' },
  { value: 'HIPAA', label: 'HIPAA' },
  { value: 'PCI-DSS', label: 'PCI-DSS' },
  { value: 'NIST', label: 'NIST CSF' },
];

// Default sections
const defaultSections = [
  'Security Governance',
  'Access Control',
  'Data Protection',
  'Incident Response',
  'Compliance & Audits',
  'Business Continuity',
];

export default function QuestionnaireBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isNewTemplate = !id || id === 'new';

  // State
  const [template, setTemplate] = useState<Template>({
    id: '',
    name: '',
    description: '',
    category: 'Security',
    framework: '',
    is_active: true,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sections, setSections] = useState<string[]>(defaultSections);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(defaultSections));
  const [loading, setLoading] = useState(!isNewTemplate);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [showAddSectionDialog, setShowAddSectionDialog] = useState(false);
  const [draggedQuestion, setDraggedQuestion] = useState<Question | null>(null);
  const [showStarterModal, setShowStarterModal] = useState(isNewTemplate);

  // Load template data
  useEffect(() => {
    if (!isNewTemplate && id) {
      loadTemplate();
    }
  }, [id]);

  const loadTemplate = async () => {
    try {
      setLoading(true);

      // Fetch template
      const { data: templateData, error: templateError } = await supabase
        .from('questionnaire_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (templateError) throw templateError;
      setTemplate(templateData);

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questionnaire_questions')
        .select('*')
        .eq('template_id', id)
        .order('order_index');

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);

      // Extract sections from questions
      const questionSections = new Set(questionsData?.map(q => q.section) || []);
      const allSections = [...new Set([...defaultSections, ...questionSections])];
      setSections(allSections);
      setExpandedSections(new Set(allSections));

    } catch (error) {
      console.error('Error loading template:', error);
      toast({
        title: 'Error',
        description: 'Failed to load template',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Save template
  const saveTemplate = async () => {
    if (!template.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a template name',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      let templateId = template.id;

      if (isNewTemplate) {
        // Create new template
        const { data: newTemplate, error: createError } = await supabase
          .from('questionnaire_templates')
          .insert({
            name: template.name,
            description: template.description,
            category: template.category,
            framework: template.framework,
            is_active: template.is_active,
            user_id: user?.id,
          })
          .select()
          .single();

        if (createError) throw createError;
        templateId = newTemplate.id;
        setTemplate(prev => ({ ...prev, id: templateId }));
      } else {
        // Update existing template
        const { error: updateError } = await supabase
          .from('questionnaire_templates')
          .update({
            name: template.name,
            description: template.description,
            category: template.category,
            framework: template.framework,
            is_active: template.is_active,
          })
          .eq('id', templateId);

        if (updateError) throw updateError;
      }

      // Save questions
      for (const question of questions) {
        if (question.isNew) {
          // Insert new question
          const { id: _, isNew, isModified, ...questionData } = question;
          const { error: insertError } = await supabase
            .from('questionnaire_questions')
            .insert({
              ...questionData,
              template_id: templateId,
            });

          if (insertError) throw insertError;
        } else if (question.isModified) {
          // Update existing question
          const { isNew, isModified, ...questionData } = question;
          const { error: updateError } = await supabase
            .from('questionnaire_questions')
            .update(questionData)
            .eq('id', question.id);

          if (updateError) throw updateError;
        }
      }

      setHasChanges(false);
      toast({
        title: 'Saved',
        description: 'Template saved successfully',
      });

      // Navigate to the saved template if it was new
      if (isNewTemplate) {
        navigate(`/questionnaire-builder/${templateId}`, { replace: true });
      }

    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Add new question
  const addQuestion = (section: string) => {
    const sectionQuestions = questions.filter(q => q.section === section);
    const maxOrder = Math.max(...sectionQuestions.map(q => q.order_index), 0);

    const newQuestion: Question = {
      id: `new-${Date.now()}`,
      section,
      question_text: '',
      question_type: 'yes_no_na',
      options: { choices: ['Yes', 'No', 'N/A'] },
      is_required: true,
      weight: 1,
      order_index: maxOrder + 1,
      help_text: null,
      compliance_mapping: null,
      risk_category: null,
      isNew: true,
    };

    setEditingQuestion(newQuestion);
    setShowQuestionDialog(true);
  };

  // Save question (from dialog)
  const saveQuestion = () => {
    if (!editingQuestion) return;

    if (!editingQuestion.question_text.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a question',
        variant: 'destructive',
      });
      return;
    }

    if (editingQuestion.isNew) {
      setQuestions(prev => [...prev, editingQuestion]);
    } else {
      setQuestions(prev =>
        prev.map(q => (q.id === editingQuestion.id ? { ...editingQuestion, isModified: true } : q))
      );
    }

    setHasChanges(true);
    setShowQuestionDialog(false);
    setEditingQuestion(null);
  };

  // Delete question
  const deleteQuestion = async (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    if (!question.isNew) {
      // Delete from database
      const { error } = await supabase
        .from('questionnaire_questions')
        .delete()
        .eq('id', questionId);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete question',
          variant: 'destructive',
        });
        return;
      }
    }

    setQuestions(prev => prev.filter(q => q.id !== questionId));
    setHasChanges(true);
  };

  // Duplicate question
  const duplicateQuestion = (question: Question) => {
    const newQuestion: Question = {
      ...question,
      id: `new-${Date.now()}`,
      question_text: `${question.question_text} (copy)`,
      order_index: question.order_index + 1,
      isNew: true,
      isModified: undefined,
    };

    setQuestions(prev => {
      const index = prev.findIndex(q => q.id === question.id);
      const newQuestions = [...prev];
      newQuestions.splice(index + 1, 0, newQuestion);
      return newQuestions;
    });
    setHasChanges(true);
  };

  // Add new section
  const addSection = () => {
    if (!newSectionName.trim()) return;
    if (sections.includes(newSectionName.trim())) {
      toast({
        title: 'Error',
        description: 'Section already exists',
        variant: 'destructive',
      });
      return;
    }

    setSections(prev => [...prev, newSectionName.trim()]);
    setExpandedSections(prev => new Set([...prev, newSectionName.trim()]));
    setNewSectionName('');
    setShowAddSectionDialog(false);
  };

  // Handle drag and drop
  const handleDragStart = (question: Question) => {
    setDraggedQuestion(question);
  };

  const handleDragOver = (e: React.DragEvent, targetQuestion: Question) => {
    e.preventDefault();
    if (!draggedQuestion || draggedQuestion.id === targetQuestion.id) return;

    const newQuestions = [...questions];
    const dragIndex = newQuestions.findIndex(q => q.id === draggedQuestion.id);
    const targetIndex = newQuestions.findIndex(q => q.id === targetQuestion.id);

    newQuestions.splice(dragIndex, 1);
    newQuestions.splice(targetIndex, 0, { ...draggedQuestion, isModified: true });

    // Update order indices
    const section = targetQuestion.section;
    let orderIndex = 1;
    newQuestions.forEach(q => {
      if (q.section === section) {
        q.order_index = orderIndex++;
        q.isModified = true;
      }
    });

    setQuestions(newQuestions);
    setHasChanges(true);
  };

  const handleDragEnd = () => {
    setDraggedQuestion(null);
  };

  // Move question to different section
  const moveToSection = (question: Question, newSection: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === question.id
          ? { ...q, section: newSection, isModified: true }
          : q
      )
    );
    setHasChanges(true);
  };

  // Group questions by section
  const questionsBySection = questions.reduce((acc, q) => {
    if (!acc[q.section]) acc[q.section] = [];
    acc[q.section].push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  // Sort questions within each section by order_index
  Object.keys(questionsBySection).forEach(section => {
    questionsBySection[section].sort((a, b) => a.order_index - b.order_index);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/settings" className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Settings
            </Link>
            <span>/</span>
            <span>Questionnaire Builder</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {isNewTemplate ? 'Create Template' : 'Edit Template'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-amber-600">
              Unsaved changes
            </Badge>
          )}
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={saveTemplate} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Template Settings */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Template Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Template Name *</Label>
                <Input
                  value={template.name}
                  onChange={(e) => {
                    setTemplate(prev => ({ ...prev, name: e.target.value }));
                    setHasChanges(true);
                  }}
                  placeholder="e.g., Standard Security Assessment"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={template.description || ''}
                  onChange={(e) => {
                    setTemplate(prev => ({ ...prev, description: e.target.value }));
                    setHasChanges(true);
                  }}
                  placeholder="Describe this template..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={template.category}
                  onValueChange={(v) => {
                    setTemplate(prev => ({ ...prev, category: v }));
                    setHasChanges(true);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Privacy">Privacy</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                    <SelectItem value="Operational">Operational</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Framework</Label>
                <Select
                  value={template.framework || 'multi-framework'}
                  onValueChange={(v) => {
                    setTemplate(prev => ({ ...prev, framework: v === 'multi-framework' ? null : v }));
                    setHasChanges(true);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select framework..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multi-framework">Multi-Framework</SelectItem>
                    <SelectItem value="SOC 2">SOC 2</SelectItem>
                    <SelectItem value="ISO 27001">ISO 27001</SelectItem>
                    <SelectItem value="GDPR">GDPR</SelectItem>
                    <SelectItem value="HIPAA">HIPAA</SelectItem>
                    <SelectItem value="PCI-DSS">PCI-DSS</SelectItem>
                    <SelectItem value="NIST CSF">NIST CSF</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={template.is_active}
                  onCheckedChange={(checked) => {
                    setTemplate(prev => ({ ...prev, is_active: checked }));
                    setHasChanges(true);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Questions</span>
                <span className="font-medium">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sections</span>
                <span className="font-medium">{sections.filter(s => questionsBySection[s]?.length > 0).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Required</span>
                <span className="font-medium">{questions.filter(q => q.is_required).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Weight</span>
                <span className="font-medium">{questions.reduce((sum, q) => sum + q.weight, 0)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Add */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Add</CardTitle>
              <CardDescription>Add questions by type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {questionTypes.slice(0, 5).map((type) => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.value}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      const newQuestion: Question = {
                        id: `new-${Date.now()}`,
                        section: sections[0],
                        question_text: '',
                        question_type: type.value,
                        options: type.value.includes('choice') ? { choices: ['Option 1', 'Option 2'] } : null,
                        is_required: true,
                        weight: 1,
                        order_index: questions.length + 1,
                        help_text: null,
                        compliance_mapping: null,
                        risk_category: null,
                        isNew: true,
                      };
                      setEditingQuestion(newQuestion);
                      setShowQuestionDialog(true);
                    }}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {type.label}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Questions */}
        <div className="lg:col-span-3 space-y-4">
          {/* Section Management */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Questions</h2>
            <Button variant="outline" size="sm" onClick={() => setShowAddSectionDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>

          {/* Sections */}
          {sections.map((section) => {
            const sectionQuestions = questionsBySection[section] || [];
            const isExpanded = expandedSections.has(section);

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
                          <Badge variant="secondary">{sectionQuestions.length} questions</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            addQuestion(section);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {sectionQuestions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No questions in this section</p>
                          <Button
                            variant="link"
                            className="mt-2"
                            onClick={() => addQuestion(section)}
                          >
                            Add your first question →
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {sectionQuestions.map((question, idx) => {
                            const TypeIcon = questionTypes.find(t => t.value === question.question_type)?.icon || FileText;

                            return (
                              <div
                                key={question.id}
                                draggable
                                onDragStart={() => handleDragStart(question)}
                                onDragOver={(e) => handleDragOver(e, question)}
                                onDragEnd={handleDragEnd}
                                className={cn(
                                  'flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-move',
                                  draggedQuestion?.id === question.id && 'opacity-50',
                                  question.isNew && 'border-primary/50',
                                  question.isModified && 'border-amber-500/50'
                                )}
                              >
                                <GripVertical className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start gap-2">
                                    <span className="text-sm text-muted-foreground font-medium">
                                      {idx + 1}.
                                    </span>
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">
                                        {question.question_text || <span className="text-muted-foreground italic">No question text</span>}
                                        {question.is_required && <span className="text-destructive ml-1">*</span>}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger>
                                              <Badge variant="outline" className="text-xs gap-1">
                                                <TypeIcon className="h-3 w-3" />
                                                {questionTypes.find(t => t.value === question.question_type)?.label}
                                              </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              {questionTypes.find(t => t.value === question.question_type)?.description}
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                        <Badge variant="outline" className="text-xs">
                                          Weight: {question.weight}
                                        </Badge>
                                        {question.compliance_mapping && (
                                          <Badge variant="outline" className="text-xs text-primary">
                                            {Object.keys(question.compliance_mapping).join(', ')}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="shrink-0">
                                      <Settings2 className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setEditingQuestion(question);
                                        setShowQuestionDialog(true);
                                      }}
                                    >
                                      <Settings2 className="h-4 w-4 mr-2" />
                                      Edit Question
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => duplicateQuestion(question)}>
                                      <Copy className="h-4 w-4 mr-2" />
                                      Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                      Move to Section
                                    </DropdownMenuItem>
                                    {sections.filter(s => s !== section).map((s) => (
                                      <DropdownMenuItem
                                        key={s}
                                        className="pl-6"
                                        onClick={() => moveToSection(question, s)}
                                      >
                                        {s}
                                      </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => deleteQuestion(question.id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      </div>

      {/* Question Edit Dialog */}
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion?.isNew ? 'Add Question' : 'Edit Question'}
            </DialogTitle>
          </DialogHeader>

          {editingQuestion && (
            <Tabs defaultValue="basic" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="options">Options</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Question *</Label>
                  <Textarea
                    value={editingQuestion.question_text}
                    onChange={(e) =>
                      setEditingQuestion(prev => prev ? { ...prev, question_text: e.target.value } : null)
                    }
                    placeholder="Enter your question..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Section</Label>
                    <Select
                      value={editingQuestion.section}
                      onValueChange={(v) =>
                        setEditingQuestion(prev => prev ? { ...prev, section: v } : null)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Question Type</Label>
                    <Select
                      value={editingQuestion.question_type}
                      onValueChange={(v) =>
                        setEditingQuestion(prev => {
                          if (!prev) return null;
                          const options = v.includes('choice')
                            ? { choices: ['Option 1', 'Option 2', 'Option 3'] }
                            : v.includes('yes_no')
                            ? { choices: v === 'yes_no_na' ? ['Yes', 'No', 'N/A'] : ['Yes', 'No'] }
                            : null;
                          return { ...prev, question_type: v, options };
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {type.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Help Text (optional)</Label>
                  <Textarea
                    value={editingQuestion.help_text || ''}
                    onChange={(e) =>
                      setEditingQuestion(prev => prev ? { ...prev, help_text: e.target.value } : null)
                    }
                    placeholder="Provide guidance or examples for answering this question..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Weight (1-10)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={editingQuestion.weight}
                      onChange={(e) =>
                        setEditingQuestion(prev =>
                          prev ? { ...prev, weight: parseInt(e.target.value) || 1 } : null
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher weight = more impact on overall score
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Risk Category</Label>
                    <Select
                      value={editingQuestion.risk_category || ''}
                      onValueChange={(v) =>
                        setEditingQuestion(prev => prev ? { ...prev, risk_category: v || null } : null)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {riskCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Required</Label>
                  <Switch
                    checked={editingQuestion.is_required}
                    onCheckedChange={(checked) =>
                      setEditingQuestion(prev => prev ? { ...prev, is_required: checked } : null)
                    }
                  />
                </div>
              </TabsContent>

              <TabsContent value="options" className="space-y-4 mt-4">
                {(editingQuestion.question_type.includes('choice') ||
                  editingQuestion.question_type.includes('yes_no')) && (
                  <div className="space-y-2">
                    <Label>Answer Options</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      {editingQuestion.question_type.includes('yes_no')
                        ? 'Standard yes/no options'
                        : 'Add or modify the available choices'}
                    </p>
                    {editingQuestion.options?.choices?.map((choice: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          value={choice}
                          onChange={(e) => {
                            const newChoices = [...(editingQuestion.options?.choices || [])];
                            newChoices[idx] = e.target.value;
                            setEditingQuestion(prev =>
                              prev ? { ...prev, options: { ...prev.options, choices: newChoices } } : null
                            );
                          }}
                          disabled={editingQuestion.question_type.includes('yes_no')}
                        />
                        {!editingQuestion.question_type.includes('yes_no') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newChoices = editingQuestion.options?.choices?.filter(
                                (_: string, i: number) => i !== idx
                              );
                              setEditingQuestion(prev =>
                                prev ? { ...prev, options: { ...prev.options, choices: newChoices } } : null
                              );
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {!editingQuestion.question_type.includes('yes_no') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newChoices = [...(editingQuestion.options?.choices || []), 'New Option'];
                          setEditingQuestion(prev =>
                            prev ? { ...prev, options: { ...prev.options, choices: newChoices } } : null
                          );
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    )}
                  </div>
                )}

                {!editingQuestion.question_type.includes('choice') &&
                  !editingQuestion.question_type.includes('yes_no') && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No additional options for this question type</p>
                    </div>
                  )}
              </TabsContent>

              <TabsContent value="compliance" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Compliance Framework Mapping</Label>
                  <p className="text-sm text-muted-foreground">
                    Map this question to specific compliance framework controls
                  </p>
                </div>

                {complianceFrameworks.map((framework) => {
                  const currentMapping = editingQuestion.compliance_mapping || {};
                  const controls = currentMapping[framework.value] || [];

                  return (
                    <div key={framework.value} className="space-y-2">
                      <Label className="text-sm">{framework.label}</Label>
                      <Input
                        value={controls.join(', ')}
                        onChange={(e) => {
                          const newControls = e.target.value
                            .split(',')
                            .map((c: string) => c.trim())
                            .filter(Boolean);
                          const newMapping = { ...currentMapping };
                          if (newControls.length > 0) {
                            newMapping[framework.value] = newControls;
                          } else {
                            delete newMapping[framework.value];
                          }
                          setEditingQuestion(prev =>
                            prev
                              ? {
                                  ...prev,
                                  compliance_mapping: Object.keys(newMapping).length > 0 ? newMapping : null,
                                }
                              : null
                          );
                        }}
                        placeholder={`e.g., ${framework.value === 'SOC2' ? 'CC6.1, CC6.2' : 'A.9.1.1, A.9.2.3'}`}
                      />
                    </div>
                  );
                })}
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuestionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveQuestion}>
              {editingQuestion?.isNew ? 'Add Question' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Section Dialog */}
      <Dialog open={showAddSectionDialog} onOpenChange={setShowAddSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Section</DialogTitle>
            <DialogDescription>
              Create a new section to organize your questions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Section Name</Label>
              <Input
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="e.g., Network Security"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSectionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addSection}>Add Section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              This is how vendors will see the questionnaire
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {sections.map((section) => {
              const sectionQuestions = questionsBySection[section] || [];
              if (sectionQuestions.length === 0) return null;

              return (
                <div key={section}>
                  <h3 className="font-semibold text-lg mb-3">{section}</h3>
                  <div className="space-y-4">
                    {sectionQuestions.map((question, idx) => (
                      <Card key={question.id}>
                        <CardContent className="pt-4">
                          <p className="font-medium">
                            {idx + 1}. {question.question_text}
                            {question.is_required && <span className="text-destructive ml-1">*</span>}
                          </p>
                          {question.help_text && (
                            <p className="text-sm text-muted-foreground mt-1">{question.help_text}</p>
                          )}
                          <div className="mt-3 p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
                            [{questionTypes.find(t => t.value === question.question_type)?.label} response]
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Starter Modal */}
      <TemplateStarterModal
        open={showStarterModal}
        onOpenChange={setShowStarterModal}
        onSelectTemplate={(template) => {
          if (template === null) {
            // User chose "Start from Scratch"
            setShowStarterModal(false);
          }
          // If template was selected, the modal handles navigation
        }}
      />
    </div>
  );
}
