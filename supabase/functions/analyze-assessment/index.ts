import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANALYSIS_SYSTEM_PROMPT = `You are an expert Third-Party Risk Management (TPRM) analyst with deep knowledge of:
- SOC 2 Trust Services Criteria
- ISO 27001 Information Security Management
- GDPR Data Protection Requirements
- NIST Cybersecurity Framework
- Industry best practices for vendor risk assessment

Your task is to analyze vendor security questionnaire responses and provide:
1. An overall risk score (0-100, where 100 is best/lowest risk)
2. Risk level classification (critical, high, medium, low)
3. Executive summary (2-3 sentences for leadership)
4. Key strengths (what the vendor does well)
5. Key concerns (areas of risk or missing controls)
6. Recommended actions (specific follow-up items)
7. Compliance alignment scores for SOC 2, ISO 27001, and GDPR
8. Detailed findings for each response that warrants attention

SCORING GUIDELINES:
- Score 90-100: Low Risk - Strong security posture, mature controls, minimal gaps
- Score 70-89: Medium Risk - Adequate security with some gaps to address
- Score 50-69: High Risk - Significant gaps requiring remediation before engagement
- Score 0-49: Critical Risk - Major security deficiencies, not recommended for sensitive data

ANALYSIS PRINCIPLES:
- Be objective and evidence-based
- Flag any answers that are concerning or need follow-up
- Consider the cumulative impact of gaps (multiple medium issues = high risk)
- Weight critical controls (MFA, encryption, incident response) more heavily
- Note when answers are vague or evasive
- Recognize that N/A answers may be legitimate or may be masking gaps
- Consider industry context when available

OUTPUT FORMAT:
Return a valid JSON object with the following structure (no markdown, no backticks):
{
  "overall_score": <number 0-100>,
  "risk_level": "<critical|high|medium|low>",
  "confidence_score": <number 0-1>,
  "executive_summary": "<2-3 sentence summary>",
  "key_strengths": ["<strength 1>", "<strength 2>", ...],
  "key_concerns": ["<concern 1>", "<concern 2>", ...],
  "recommended_actions": [
    {"action": "<action>", "priority": "<critical|high|medium|low>", "rationale": "<why>"}
  ],
  "compliance_scores": {
    "SOC2": <number 0-100>,
    "ISO27001": <number 0-100>,
    "GDPR": <number 0-100>
  },
  "findings": [
    {
      "question_id": "<uuid>",
      "finding_type": "<strength|concern|critical_gap|needs_clarification>",
      "summary": "<brief finding>",
      "detail": "<detailed explanation>",
      "compliance_impact": ["<SOC2 CC1.1>", "<ISO27001 A.9.1>"],
      "recommended_action": "<specific action if needed>"
    }
  ],
  "flagged_question_ids": ["<uuid1>", "<uuid2>"]
}`;

interface QuestionResponse {
  question_id: string;
  question_text: string;
  section: string;
  question_type: string;
  weight: number;
  compliance_mapping: Record<string, string[]> | null;
  response_text: string | null;
  response_choice: { answer?: string } | string[] | null;
  file_path: string | null;
}

function formatResponsesForAnalysis(responses: QuestionResponse[], vendorInfo: { name?: string; category?: string; annual_value?: number }): string {
  let formatted = `## Vendor Information\n`;
  formatted += `- **Vendor Name:** ${vendorInfo.name || 'Not provided'}\n`;
  formatted += `- **Category:** ${vendorInfo.category || 'Not provided'}\n`;
  formatted += `- **Annual Contract Value:** $${vendorInfo.annual_value?.toLocaleString() || 'Not provided'}\n\n`;
  
  formatted += `## Questionnaire Responses\n\n`;
  
  const sections = new Map<string, QuestionResponse[]>();
  responses.forEach(r => {
    const section = r.section || 'General';
    if (!sections.has(section)) sections.set(section, []);
    sections.get(section)!.push(r);
  });
  
  sections.forEach((questions, sectionName) => {
    formatted += `### ${sectionName}\n\n`;
    
    questions.forEach((q, idx) => {
      formatted += `**Q${idx + 1} (ID: ${q.question_id}, Weight: ${q.weight}):** ${q.question_text}\n`;
      
      let answer = 'No response provided';
      if (q.response_choice) {
        if (typeof q.response_choice === 'object' && 'answer' in q.response_choice && q.response_choice.answer) {
          answer = q.response_choice.answer;
        } else if (Array.isArray(q.response_choice)) {
          answer = q.response_choice.join(', ');
        } else {
          answer = JSON.stringify(q.response_choice);
        }
      } else if (q.response_text) {
        answer = q.response_text;
      }
      
      if (q.file_path) {
        answer += ' [Document uploaded]';
      }
      
      formatted += `**Answer:** ${answer}\n`;
      
      if (q.compliance_mapping) {
        const mappings = Object.entries(q.compliance_mapping)
          .map(([framework, controls]) => `${framework}: ${controls.join(', ')}`)
          .join('; ');
        formatted += `*Compliance Mapping: ${mappings}*\n`;
      }
      
      formatted += '\n';
    });
  });
  
  return formatted;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assessment_id } = await req.json();
    
    if (!assessment_id) {
      throw new Error('assessment_id is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('No AI API key configured');
    }

    const { data: assessment, error: assessmentError } = await supabase
      .from('vendor_assessments')
      .select(`
        *,
        vendors (name, category, annual_value, risk_tier),
        questionnaire_templates (name, framework)
      `)
      .eq('id', assessment_id)
      .single();

    if (assessmentError) throw assessmentError;
    if (!assessment) throw new Error('Assessment not found');

    const { data: responses, error: responsesError } = await supabase
      .from('assessment_responses')
      .select(`
        *,
        questionnaire_questions (
          id,
          question_text,
          section,
          question_type,
          weight,
          compliance_mapping,
          expected_answer
        )
      `)
      .eq('assessment_id', assessment_id);

    if (responsesError) throw responsesError;
    if (!responses || responses.length === 0) {
      throw new Error('No responses found for this assessment');
    }

    const formattedResponses = responses.map(r => ({
      question_id: r.question_id,
      question_text: r.questionnaire_questions.question_text,
      section: r.questionnaire_questions.section,
      question_type: r.questionnaire_questions.question_type,
      weight: r.questionnaire_questions.weight,
      compliance_mapping: r.questionnaire_questions.compliance_mapping,
      response_text: r.response_text,
      response_choice: r.response_choice,
      file_path: r.file_path,
    }));

    const vendorInfo = assessment.vendors || {};
    const analysisInput = formatResponsesForAnalysis(formattedResponses, vendorInfo);

    const startTime = Date.now();
    const modelUsed = 'google/gemini-2.5-flash';
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelUsed,
        messages: [
          { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
          { role: 'user', content: `Please analyze the following vendor security questionnaire responses and provide a comprehensive risk assessment:\n\n${analysisInput}` }
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    const tokensUsed = data.usage?.total_tokens || 0;
    const processingTime = Date.now() - startTime;

    let analysis;
    try {
      let cleanResponse = aiResponse.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.slice(7);
      }
      if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.slice(3);
      }
      if (cleanResponse.endsWith('```')) {
        cleanResponse = cleanResponse.slice(0, -3);
      }
      analysis = JSON.parse(cleanResponse.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Failed to parse AI analysis response');
    }

    const { error: upsertError } = await supabase
      .from('assessment_ai_analysis')
      .upsert({
        assessment_id,
        overall_score: analysis.overall_score,
        risk_level: analysis.risk_level,
        confidence_score: analysis.confidence_score,
        executive_summary: analysis.executive_summary,
        key_strengths: analysis.key_strengths,
        key_concerns: analysis.key_concerns,
        recommended_actions: analysis.recommended_actions,
        compliance_scores: analysis.compliance_scores,
        findings: analysis.findings,
        flagged_responses: analysis.flagged_question_ids,
        model_used: modelUsed,
        tokens_used: tokensUsed,
        processing_time_ms: processingTime,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'assessment_id'
      });

    if (upsertError) throw upsertError;

    await supabase
      .from('vendor_assessments')
      .update({
        score: analysis.overall_score,
        risk_level: analysis.risk_level,
        ai_analyzed_at: new Date().toISOString(),
      })
      .eq('id', assessment_id);

    if (analysis.findings && Array.isArray(analysis.findings)) {
      for (const finding of analysis.findings) {
        if (finding.question_id && finding.finding_type) {
          const riskFlag = finding.finding_type === 'critical_gap' ? 'critical' :
                          finding.finding_type === 'concern' ? 'high' :
                          finding.finding_type === 'needs_clarification' ? 'medium' : null;
          
          if (riskFlag) {
            await supabase
              .from('assessment_responses')
              .update({
                is_flagged: true,
                ai_risk_flag: riskFlag,
                ai_analysis: finding.detail,
                ai_suggestions: { recommended_action: finding.recommended_action }
              })
              .eq('assessment_id', assessment_id)
              .eq('question_id', finding.question_id);
          }
        }
      }
    }

    // Auto-create issues from recommended actions for remediation tracking
    if (analysis.recommended_actions && Array.isArray(analysis.recommended_actions)) {
      const priorityToDays: Record<string, number> = {
        critical: 7,
        high: 14,
        medium: 30,
        low: 60,
      };

      for (const action of analysis.recommended_actions) {
        const severity = action.priority || 'medium';
        const daysUntilDue = priorityToDays[severity] || 30;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + daysUntilDue);

        // Check if a similar issue already exists for this assessment
        const { data: existingIssue } = await supabase
          .from('issues')
          .select('id')
          .eq('assessment_id', assessment_id)
          .eq('title', action.action.substring(0, 100))
          .maybeSingle();

        if (!existingIssue) {
          await supabase
            .from('issues')
            .insert({
              vendor_id: assessment.vendor_id,
              assessment_id: assessment_id,
              user_id: assessment.user_id,
              organization_id: assessment.organization_id,
              title: action.action.substring(0, 100),
              description: `${action.rationale}\n\nGenerated from AI analysis of assessment: ${assessment.title}`,
              severity: severity,
              status: 'open',
              due_date: dueDate.toISOString(),
            });
        }
      }

      console.log(`Created ${analysis.recommended_actions.length} remediation issues for assessment ${assessment_id}`);
    }

    return new Response(JSON.stringify({
      success: true,
      assessment_id,
      analysis: {
        overall_score: analysis.overall_score,
        risk_level: analysis.risk_level,
        executive_summary: analysis.executive_summary,
        key_strengths: analysis.key_strengths,
        key_concerns: analysis.key_concerns,
        recommended_actions: analysis.recommended_actions,
        compliance_scores: analysis.compliance_scores,
        findings_count: analysis.findings?.length || 0,
        flagged_count: analysis.flagged_question_ids?.length || 0,
      },
      metadata: {
        model_used: modelUsed,
        tokens_used: tokensUsed,
        processing_time_ms: processingTime,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-assessment:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});