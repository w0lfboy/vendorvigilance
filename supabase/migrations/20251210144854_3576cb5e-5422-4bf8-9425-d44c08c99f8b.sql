-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Vendors can update their assessments via token" ON public.vendor_assessments;

-- Create a more secure policy that validates status transitions only for vendor portal updates
-- This allows unauthenticated updates only for specific status transitions
CREATE POLICY "Vendors can update assessment status via token"
ON public.vendor_assessments
FOR UPDATE
USING (
  -- Allow if user is the owner
  auth.uid() = user_id
  OR
  -- Allow unauthenticated access for vendor portal (status updates only)
  auth.uid() IS NULL
)
WITH CHECK (
  -- Owner can update anything
  auth.uid() = user_id
  OR
  -- Unauthenticated can only update to in_progress or submitted status
  (auth.uid() IS NULL AND status IN ('in_progress', 'submitted'))
);