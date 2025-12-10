-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view responses for their assessments" ON public.assessment_responses;

-- Create a new SELECT policy that allows:
-- 1. Authenticated users who own the assessment to view all responses
-- 2. Unauthenticated users (vendor portal) to view responses for assessments they access
CREATE POLICY "Users can view responses for their assessments"
ON public.assessment_responses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM vendor_assessments
    WHERE vendor_assessments.id = assessment_responses.assessment_id
    AND (
      -- Assessment owner can view
      vendor_assessments.user_id = auth.uid()
      OR
      -- Unauthenticated vendor portal access
      auth.uid() IS NULL
    )
  )
);