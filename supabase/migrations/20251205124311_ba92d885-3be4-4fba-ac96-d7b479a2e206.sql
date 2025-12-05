-- Allow reading questionnaire templates that have null user_id (system templates)
CREATE POLICY "Anyone can view system templates" 
ON public.questionnaire_templates 
FOR SELECT 
USING (user_id IS NULL OR auth.uid() = user_id);

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can manage their questionnaire templates" ON public.questionnaire_templates;

-- Recreate a more permissive management policy for user-owned templates
CREATE POLICY "Users can manage their own templates"
ON public.questionnaire_templates
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);