import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANALYSIS_SYSTEM_PROMPT = `You are an expert compliance and security document analyst specializing in third-party risk management (TPRM). Your role is to analyze vendor documents including SOC 2 reports, ISO certifications, security policies, and contracts.

For each document, provide:
1. A concise executive summary (2-3 sentences)
2. Key findings (list of important points)
3. Risk flags (any concerns or gaps identified)
4. Compliance mapping (which frameworks/controls this document addresses)
5. Recommended follow-up actions

Respond in JSON format:
{
  "summary": "string",
  "keyFindings": ["string"],
  "riskFlags": [{"severity": "high|medium|low", "description": "string"}],
  "complianceMapping": {"framework": ["controls"]},
  "recommendedActions": ["string"],
  "documentType": "soc2_report|iso_certificate|policy|contract|other",
  "validityPeriod": {"start": "date or null", "end": "date or null"},
  "overallRiskLevel": "low|medium|high|critical"
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, documentContent, documentName, documentType } = await req.json();

    if (!documentId) {
      throw new Error('Document ID is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Analyzing document: ${documentName} (${documentId})`);

    // Prepare the prompt with document context
    const userPrompt = `Please analyze this ${documentType || 'security'} document.

Document Name: ${documentName}
Document Type: ${documentType}

${documentContent ? `Document Content:
${documentContent.substring(0, 50000)}` : 'Note: Document content was not extractable. Please provide a general analysis template for this document type.'}

Provide a comprehensive analysis following the JSON format specified.`;

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const analysisText = aiResponse.choices?.[0]?.message?.content;

    if (!analysisText) {
      throw new Error('No analysis content received from AI');
    }

    console.log('Raw AI response:', analysisText);

    // Parse the JSON response from AI
    let analysis;
    try {
      // Clean up potential markdown formatting
      const cleanedText = analysisText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      analysis = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Create a structured response from the text
      analysis = {
        summary: analysisText.substring(0, 500),
        keyFindings: ['Analysis completed - see summary for details'],
        riskFlags: [],
        complianceMapping: {},
        recommendedActions: ['Review the document manually for detailed assessment'],
        overallRiskLevel: 'medium'
      };
    }

    // Update the document with analysis results
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        ai_summary: analysis.summary,
        ai_analysis: analysis,
        analyzed_at: new Date().toISOString(),
        key_findings: analysis.keyFindings,
        risk_flags: analysis.riskFlags,
        compliance_mapping: analysis.complianceMapping,
        review_status: 'analyzed',
      })
      .eq('id', documentId);

    if (updateError) {
      console.error('Error updating document:', updateError);
      throw new Error(`Failed to save analysis: ${updateError.message}`);
    }

    console.log(`Document ${documentId} analysis saved successfully`);

    return new Response(JSON.stringify({ 
      success: true, 
      analysis,
      message: 'Document analyzed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-document function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
