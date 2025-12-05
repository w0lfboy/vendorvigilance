-- Allow reading questions from system templates (templates with null user_id)
CREATE POLICY "Anyone can view questions from system templates"
ON public.questionnaire_questions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM questionnaire_templates 
    WHERE questionnaire_templates.id = questionnaire_questions.template_id 
    AND questionnaire_templates.user_id IS NULL
  )
  OR 
  EXISTS (
    SELECT 1 FROM questionnaire_templates 
    WHERE questionnaire_templates.id = questionnaire_questions.template_id 
    AND questionnaire_templates.user_id = auth.uid()
  )
);