-- Add unique constraint for assessment_id and question_id combination
-- This is needed for upsert operations in the vendor portal
ALTER TABLE public.assessment_responses 
ADD CONSTRAINT assessment_responses_assessment_question_unique 
UNIQUE (assessment_id, question_id);