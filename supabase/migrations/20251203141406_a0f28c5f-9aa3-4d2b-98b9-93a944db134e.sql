-- Create enum types for risk and status
CREATE TYPE public.risk_tier AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE public.vendor_status AS ENUM ('active', 'pending', 'offboarded');
CREATE TYPE public.assessment_status AS ENUM ('not_started', 'in_progress', 'completed');
CREATE TYPE public.document_type AS ENUM ('soc2_report', 'iso_certificate', 'policy', 'contract');
CREATE TYPE public.document_status AS ENUM ('active', 'expired', 'expiring_soon');

-- Create vendors table
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  website TEXT,
  category TEXT NOT NULL,
  risk_score NUMERIC(3,1) DEFAULT 0,
  risk_tier public.risk_tier DEFAULT 'low',
  status public.vendor_status DEFAULT 'pending',
  annual_value NUMERIC(12,2) DEFAULT 0,
  last_assessment TIMESTAMPTZ,
  next_assessment TIMESTAMPTZ,
  open_issues INTEGER DEFAULT 0,
  documents_count INTEGER DEFAULT 0,
  contact_name TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create assessments table
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  template_name TEXT NOT NULL,
  status public.assessment_status DEFAULT 'not_started',
  progress INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  due_date TIMESTAMPTZ NOT NULL,
  completed_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type public.document_type NOT NULL,
  upload_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  expiration_date TIMESTAMPTZ,
  size INTEGER DEFAULT 0,
  status public.document_status DEFAULT 'active',
  file_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create activities table
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  assignee TEXT,
  completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  dismissed BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security on all tables
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for vendors
CREATE POLICY "Users can view their own vendors"
ON public.vendors FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vendors"
ON public.vendors FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendors"
ON public.vendors FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vendors"
ON public.vendors FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for assessments
CREATE POLICY "Users can view their own assessments"
ON public.assessments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments"
ON public.assessments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
ON public.assessments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assessments"
ON public.assessments FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for documents
CREATE POLICY "Users can view their own documents"
ON public.documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents"
ON public.documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
ON public.documents FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
ON public.documents FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for activities
CREATE POLICY "Users can view their own activities"
ON public.activities FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities"
ON public.activities FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS policies for tasks
CREATE POLICY "Users can view their own tasks"
ON public.tasks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
ON public.tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
ON public.tasks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
ON public.tasks FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for alerts
CREATE POLICY "Users can view their own alerts"
ON public.alerts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alerts"
ON public.alerts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
ON public.alerts FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_vendors_updated_at
BEFORE UPDATE ON public.vendors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at
BEFORE UPDATE ON public.assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();