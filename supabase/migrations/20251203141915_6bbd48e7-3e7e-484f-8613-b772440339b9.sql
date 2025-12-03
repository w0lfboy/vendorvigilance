-- Create questionnaire templates table
CREATE TABLE public.questionnaire_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  framework TEXT, -- SIG, AITEC, GDPR, PCI, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create questionnaire questions table
CREATE TABLE public.questionnaire_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.questionnaire_templates(id) ON DELETE CASCADE NOT NULL,
  section TEXT NOT NULL DEFAULT 'General',
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'text', -- text, single_choice, multiple_choice, file_upload
  options JSONB, -- For choice questions
  is_required BOOLEAN DEFAULT true,
  weight INTEGER DEFAULT 1, -- For scoring
  order_index INTEGER DEFAULT 0,
  compliance_mapping JSONB, -- Maps to frameworks like GDPR, PCI, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create vendor assessments (sent questionnaires)
CREATE TABLE public.vendor_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.questionnaire_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, submitted, under_review, completed
  due_date TIMESTAMPTZ NOT NULL,
  submitted_date TIMESTAMPTZ,
  reviewed_date TIMESTAMPTZ,
  score NUMERIC(5,2),
  risk_level TEXT, -- critical, high, medium, low
  access_token UUID DEFAULT gen_random_uuid(), -- For vendor portal access
  is_recurring BOOLEAN DEFAULT false,
  recurrence_interval TEXT, -- monthly, quarterly, annually
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create assessment responses table
CREATE TABLE public.assessment_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES public.vendor_assessments(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questionnaire_questions(id) ON DELETE CASCADE NOT NULL,
  response_text TEXT,
  response_choice JSONB,
  file_path TEXT,
  score NUMERIC(3,1),
  is_flagged BOOLEAN DEFAULT false,
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create issues table for tracking remediation
CREATE TABLE public.issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  assessment_id UUID REFERENCES public.vendor_assessments(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium', -- critical, high, medium, low
  status TEXT NOT NULL DEFAULT 'open', -- open, in_progress, resolved, closed
  resolution_notes TEXT,
  due_date TIMESTAMPTZ,
  resolved_date TIMESTAMPTZ,
  assigned_to TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS on all new tables
ALTER TABLE public.questionnaire_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- RLS policies for questionnaire_templates
CREATE POLICY "Users can manage their questionnaire templates"
ON public.questionnaire_templates FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for questionnaire_questions (linked to templates)
CREATE POLICY "Users can manage questions for their templates"
ON public.questionnaire_questions FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.questionnaire_templates 
  WHERE id = questionnaire_questions.template_id 
  AND user_id = auth.uid()
));

-- RLS policies for vendor_assessments
CREATE POLICY "Users can manage their vendor assessments"
ON public.vendor_assessments FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Public access for vendor portal (via access token)
CREATE POLICY "Vendors can view their assessments via token"
ON public.vendor_assessments FOR SELECT
USING (true); -- Token validation happens in application layer

-- RLS policies for assessment_responses
CREATE POLICY "Users can view responses for their assessments"
ON public.assessment_responses FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.vendor_assessments 
  WHERE id = assessment_responses.assessment_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Anyone can insert responses"
ON public.assessment_responses FOR INSERT
WITH CHECK (true); -- Vendors submit via portal

CREATE POLICY "Users can update responses for their assessments"
ON public.assessment_responses FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.vendor_assessments 
  WHERE id = assessment_responses.assessment_id 
  AND user_id = auth.uid()
));

-- RLS policies for issues
CREATE POLICY "Users can manage their issues"
ON public.issues FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-documents', 'vendor-documents', false);

-- Storage policies for vendor documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vendor-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'vendor-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vendor-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add triggers for updated_at
CREATE TRIGGER update_questionnaire_templates_updated_at
BEFORE UPDATE ON public.questionnaire_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_assessments_updated_at
BEFORE UPDATE ON public.vendor_assessments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assessment_responses_updated_at
BEFORE UPDATE ON public.assessment_responses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_issues_updated_at
BEFORE UPDATE ON public.issues
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();