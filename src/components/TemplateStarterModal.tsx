import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Building2,
  Sparkles,
  Shield,
  Heart,
  CreditCard,
  Cloud,
  Zap,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Template definitions
interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  questionCount: number;
  frameworks: string[];
  category: 'standard' | 'industry' | 'scratch';
  seedKey?: string; // Key to load from questionnaire_template_seeds table
}

const complianceTemplates: StarterTemplate[] = [
  {
    id: 'soc2',
    name: 'SOC 2 Type II',
    description: 'Trust Services Criteria covering security, availability, processing integrity, confidentiality, and privacy',
    icon: Shield,
    questionCount: 45,
    frameworks: ['SOC 2'],
    category: 'standard',
    seedKey: 'soc2_type2',
  },
  {
    id: 'iso27001',
    name: 'ISO 27001',
    description: 'Information security management system controls based on Annex A',
    icon: Shield,
    questionCount: 52,
    frameworks: ['ISO 27001'],
    category: 'standard',
    seedKey: 'iso27001',
  },
  {
    id: 'nist_csf',
    name: 'NIST Cybersecurity Framework',
    description: 'Identify, Protect, Detect, Respond, and Recover functions',
    icon: Shield,
    questionCount: 38,
    frameworks: ['NIST CSF'],
    category: 'standard',
    seedKey: 'nist_csf',
  },
  {
    id: 'hipaa',
    name: 'HIPAA Security',
    description: 'Healthcare data protection and privacy requirements',
    icon: Heart,
    questionCount: 32,
    frameworks: ['HIPAA'],
    category: 'standard',
    seedKey: 'hipaa',
  },
  {
    id: 'pci_dss',
    name: 'PCI DSS',
    description: 'Payment card industry data security standards',
    icon: CreditCard,
    questionCount: 36,
    frameworks: ['PCI DSS'],
    category: 'standard',
    seedKey: 'pci_dss',
  },
  {
    id: 'gdpr',
    name: 'GDPR Privacy',
    description: 'EU General Data Protection Regulation requirements',
    icon: Shield,
    questionCount: 24,
    frameworks: ['GDPR'],
    category: 'standard',
    seedKey: 'gdpr',
  },
];

const industryTemplates: StarterTemplate[] = [
  {
    id: 'saas_vendor',
    name: 'SaaS Vendor Assessment',
    description: 'Comprehensive assessment for cloud software providers including SOC 2, data handling, and business continuity',
    icon: Cloud,
    questionCount: 48,
    frameworks: ['SOC 2', 'GDPR', 'Business Continuity'],
    category: 'industry',
    seedKey: 'saas_vendor',
  },
  {
    id: 'healthcare_vendor',
    name: 'Healthcare Vendor',
    description: 'HIPAA-focused assessment with BAA requirements and PHI handling',
    icon: Heart,
    questionCount: 42,
    frameworks: ['HIPAA', 'SOC 2', 'BAA'],
    category: 'industry',
    seedKey: 'healthcare_vendor',
  },
  {
    id: 'financial_services',
    name: 'Financial Services',
    description: 'Banking and fintech vendor assessment with GLBA and SOX considerations',
    icon: CreditCard,
    questionCount: 55,
    frameworks: ['SOC 2', 'PCI DSS', 'GLBA'],
    category: 'industry',
    seedKey: 'financial_services',
  },
  {
    id: 'critical_vendor',
    name: 'Critical/High-Risk Vendor',
    description: 'In-depth assessment for vendors with significant access or business impact',
    icon: Shield,
    questionCount: 65,
    frameworks: ['SOC 2', 'ISO 27001', 'BCP', 'Incident Response'],
    category: 'industry',
    seedKey: 'critical_vendor',
  },
  {
    id: 'quick_assessment',
    name: 'Quick Assessment',
    description: 'Streamlined 15-question assessment for low-risk vendors',
    icon: Zap,
    questionCount: 15,
    frameworks: ['Basic Security'],
    category: 'industry',
    seedKey: 'quick_assessment',
  },
];

type Step = 'choose' | 'standard' | 'industry';

interface TemplateStarterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: StarterTemplate | null) => void;
}

export default function TemplateStarterModal({
  open,
  onOpenChange,
  onSelectTemplate,
}: TemplateStarterModalProps) {
  const [step, setStep] = useState<Step>('choose');
  const [selectedTemplate, setSelectedTemplate] = useState<StarterTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartFromScratch = () => {
    onSelectTemplate(null);
    onOpenChange(false);
  };

  const handleSelectTemplate = async (template: StarterTemplate) => {
    setSelectedTemplate(template);
    setLoading(true);

    try {
      // Create the template in the database
      const { data: newTemplate, error: templateError } = await supabase
        .from('questionnaire_templates')
        .insert({
          name: template.name,
          description: template.description,
          category: 'Security',
          framework: template.frameworks.join(', '),
          is_active: true,
          user_id: user?.id,
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Load questions from seed if available
      if (template.seedKey) {
        const { data: seedData, error: seedError } = await supabase
          .from('questionnaire_template_seeds')
          .select('questions')
          .eq('seed_key', template.seedKey)
          .single();

        if (!seedError && seedData?.questions) {
          // Insert the seed questions
          const questionsToInsert = (seedData.questions as any[]).map((q: any, index: number) => ({
            ...q,
            template_id: newTemplate.id,
            order_index: index + 1,
          }));

          const { error: insertError } = await supabase
            .from('questionnaire_questions')
            .insert(questionsToInsert);

          if (insertError) {
            console.error('Error inserting seed questions:', insertError);
            // Don't throw - template was created, just without questions
          }
        }
      }

      toast({
        title: 'Template Created',
        description: `${template.name} template created with ${template.questionCount} questions`,
      });

      // Navigate to the new template
      navigate(`/questionnaire-builder/${newTemplate.id}`);
      onOpenChange(false);

    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create template',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setSelectedTemplate(null);
    }
  };

  const handleBack = () => {
    setStep('choose');
    setSelectedTemplate(null);
  };

  const renderChooseStep = () => (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Create New Template</DialogTitle>
        <DialogDescription>
          Choose how you want to start building your questionnaire
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        {/* Start from Standard */}
        <Card 
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setStep('standard')}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-base">Start from Compliance Standard</CardTitle>
                  <CardDescription className="text-sm">
                    SOC 2, ISO 27001, NIST, HIPAA, PCI DSS, GDPR
                  </CardDescription>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
        </Card>

        {/* Start from Industry */}
        <Card 
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setStep('industry')}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-base">Start from Industry Template</CardTitle>
                  <CardDescription className="text-sm">
                    SaaS, Healthcare, Financial Services, Quick Assessment
                  </CardDescription>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
        </Card>

        {/* Start from Scratch */}
        <Card 
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={handleStartFromScratch}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-base">Start from Scratch</CardTitle>
                  <CardDescription className="text-sm">
                    Build your own custom questionnaire from the ground up
                  </CardDescription>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );

  const renderTemplateList = (templates: StarterTemplate[], title: string, description: string) => (
    <div className="space-y-4">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            ← Back
          </Button>
        </div>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <div className="grid gap-3 py-2 max-h-[400px] overflow-y-auto">
        {templates.map((template) => {
          const Icon = template.icon;
          const isSelected = selectedTemplate?.id === template.id;
          const isLoading = loading && isSelected;

          return (
            <Card
              key={template.id}
              className={cn(
                'cursor-pointer transition-all',
                isSelected ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50',
                isLoading && 'opacity-70'
              )}
              onClick={() => !loading && handleSelectTemplate(template)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    template.category === 'standard' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'
                  )}>
                    <Icon className={cn(
                      'h-5 w-5',
                      template.category === 'standard' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {template.questionCount} questions
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {template.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.frameworks.map((framework) => (
                        <Badge key={framework} variant="outline" className="text-xs">
                          {framework}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                  ) : isSelected ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'choose' && renderChooseStep()}
        {step === 'standard' && renderTemplateList(
          complianceTemplates,
          'Compliance Standards',
          'Choose a compliance framework to start with pre-built questions'
        )}
        {step === 'industry' && renderTemplateList(
          industryTemplates,
          'Industry Templates',
          'Choose an industry-specific template with combined frameworks'
        )}
      </DialogContent>
    </Dialog>
  );
}

// Export the template definitions for use elsewhere
export { complianceTemplates, industryTemplates };
export type { StarterTemplate };
