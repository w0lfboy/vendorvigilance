-- =============================================================================
-- PART 1: SUPER ADMIN ROLE SYSTEM
-- =============================================================================

-- Create enum for app-wide roles (separate from org roles)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('super_admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create super admin table
CREATE TABLE IF NOT EXISTS public.super_admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- Only super admins can view super admins
CREATE POLICY "Super admins can view all super admins"
ON public.super_admins FOR SELECT
USING (EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = auth.uid()));

-- Only super admins can manage super admins
CREATE POLICY "Super admins can manage super admins"
ON public.super_admins FOR ALL
USING (EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = auth.uid()));

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins
    WHERE user_id = _user_id
  )
$$;

-- Add INSERT policy for organizations (only super admins)
CREATE POLICY "Super admins can create organizations"
ON public.organizations FOR INSERT
WITH CHECK (is_super_admin(auth.uid()));

-- Add DELETE policy for organizations (only super admins)
CREATE POLICY "Super admins can delete organizations"
ON public.organizations FOR DELETE
USING (is_super_admin(auth.uid()));

-- Super admins can view all organizations
CREATE POLICY "Super admins can view all organizations"
ON public.organizations FOR SELECT
USING (is_super_admin(auth.uid()));

-- Super admins can update all organizations
CREATE POLICY "Super admins can update all organizations"
ON public.organizations FOR UPDATE
USING (is_super_admin(auth.uid()));

-- Super admins can manage all org members
CREATE POLICY "Super admins can manage all org members"
ON public.organization_members FOR ALL
USING (is_super_admin(auth.uid()))
WITH CHECK (is_super_admin(auth.uid()));

-- =============================================================================
-- PART 2: AI ANALYSIS SCHEMA ENHANCEMENTS
-- =============================================================================

-- Create enum for question types (more explicit than TEXT)
DO $$ BEGIN
  CREATE TYPE public.question_type AS ENUM (
    'yes_no',
    'yes_no_na',
    'single_choice',
    'multi_choice',
    'text_short',
    'text_long',
    'file_upload',
    'date',
    'number'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Store AI analysis results for each assessment
CREATE TABLE IF NOT EXISTS public.assessment_ai_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES public.vendor_assessments(id) ON DELETE CASCADE NOT NULL UNIQUE,
  overall_score NUMERIC(5,2),
  risk_level TEXT,
  confidence_score NUMERIC(3,2),
  executive_summary TEXT,
  key_strengths JSONB,
  key_concerns JSONB,
  recommended_actions JSONB,
  compliance_scores JSONB,
  findings JSONB,
  flagged_responses JSONB,
  model_used TEXT DEFAULT 'gemini-2.5-flash',
  analysis_version TEXT DEFAULT '1.0',
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on AI analysis table
ALTER TABLE public.assessment_ai_analysis ENABLE ROW LEVEL SECURITY;

-- RLS policy for AI analysis (linked to assessments the user owns)
CREATE POLICY "Users can view AI analysis for their assessments"
ON public.assessment_ai_analysis FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.vendor_assessments 
  WHERE id = assessment_ai_analysis.assessment_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can create AI analysis for their assessments"
ON public.assessment_ai_analysis FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.vendor_assessments 
  WHERE id = assessment_ai_analysis.assessment_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can update AI analysis for their assessments"
ON public.assessment_ai_analysis FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.vendor_assessments 
  WHERE id = assessment_ai_analysis.assessment_id 
  AND user_id = auth.uid()
));

-- Add AI-related columns to assessment_responses
ALTER TABLE public.assessment_responses 
  ADD COLUMN IF NOT EXISTS ai_score NUMERIC(3,1),
  ADD COLUMN IF NOT EXISTS ai_analysis TEXT,
  ADD COLUMN IF NOT EXISTS ai_risk_flag TEXT,
  ADD COLUMN IF NOT EXISTS ai_suggestions JSONB;

-- Add columns to vendor_assessments for tracking
ALTER TABLE public.vendor_assessments
  ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT now();

-- Add help text and risk weight to questions
ALTER TABLE public.questionnaire_questions
  ADD COLUMN IF NOT EXISTS help_text TEXT,
  ADD COLUMN IF NOT EXISTS risk_category TEXT,
  ADD COLUMN IF NOT EXISTS expected_answer JSONB;

-- Trigger for AI analysis updated_at
DROP TRIGGER IF EXISTS update_assessment_ai_analysis_updated_at ON public.assessment_ai_analysis;
CREATE TRIGGER update_assessment_ai_analysis_updated_at
BEFORE UPDATE ON public.assessment_ai_analysis
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update assessment progress when response is saved
CREATE OR REPLACE FUNCTION public.update_assessment_on_response()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.vendor_assessments
  SET last_activity_at = now()
  WHERE id = NEW.assessment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_update_assessment_on_response ON public.assessment_responses;
CREATE TRIGGER trigger_update_assessment_on_response
AFTER INSERT OR UPDATE ON public.assessment_responses
FOR EACH ROW EXECUTE FUNCTION public.update_assessment_on_response();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_assessment_responses_assessment_id 
ON public.assessment_responses(assessment_id);

CREATE INDEX IF NOT EXISTS idx_questionnaire_questions_template_id 
ON public.questionnaire_questions(template_id);

CREATE INDEX IF NOT EXISTS idx_vendor_assessments_vendor_id 
ON public.vendor_assessments(vendor_id);

CREATE INDEX IF NOT EXISTS idx_vendor_assessments_status 
ON public.vendor_assessments(status);

CREATE INDEX IF NOT EXISTS idx_vendor_assessments_access_token 
ON public.vendor_assessments(access_token);

-- Function to calculate assessment completion percentage
CREATE OR REPLACE FUNCTION public.calculate_assessment_progress(p_assessment_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_questions INTEGER;
  answered_questions INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_questions
  FROM public.questionnaire_questions qq
  JOIN public.vendor_assessments va ON va.template_id = qq.template_id
  WHERE va.id = p_assessment_id AND qq.is_required = true;
  
  IF total_questions = 0 THEN
    RETURN 100;
  END IF;
  
  SELECT COUNT(*) INTO answered_questions
  FROM public.assessment_responses ar
  JOIN public.questionnaire_questions qq ON qq.id = ar.question_id
  WHERE ar.assessment_id = p_assessment_id 
    AND qq.is_required = true
    AND (ar.response_text IS NOT NULL OR ar.response_choice IS NOT NULL OR ar.file_path IS NOT NULL);
  
  RETURN ROUND((answered_questions::NUMERIC / total_questions::NUMERIC) * 100);
END;
$$;