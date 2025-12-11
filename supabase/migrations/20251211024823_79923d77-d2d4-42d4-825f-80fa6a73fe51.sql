-- Add AI analysis and review fields to documents table
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS ai_summary TEXT,
ADD COLUMN IF NOT EXISTS ai_analysis JSONB,
ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS reviewer_notes TEXT,
ADD COLUMN IF NOT EXISTS key_findings JSONB,
ADD COLUMN IF NOT EXISTS risk_flags JSONB,
ADD COLUMN IF NOT EXISTS compliance_mapping JSONB;

-- Create index for review status filtering
CREATE INDEX IF NOT EXISTS idx_documents_review_status ON public.documents(review_status);
CREATE INDEX IF NOT EXISTS idx_documents_analyzed_at ON public.documents(analyzed_at);