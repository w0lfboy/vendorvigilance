import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vendor, type = 'suggestions' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'suggestions') {
      systemPrompt = `You are an expert Third-Party Risk Management analyst. Analyze vendor data and provide actionable risk mitigation suggestions. Be concise and specific. Return exactly 3 suggestions in JSON format with fields: title (short action), description (why important), priority (high/medium/low).`;
      userPrompt = `Analyze this vendor and provide risk mitigation suggestions:
Vendor: ${vendor.name}
Category: ${vendor.category}
Risk Score: ${vendor.risk_score}/10
Risk Tier: ${vendor.risk_tier}
Open Issues: ${vendor.open_issues}
Last Assessment: ${vendor.last_assessment || 'Never'}
Documents Count: ${vendor.documents_count}
Annual Value: $${vendor.annual_value}`;
    } else if (type === 'assessment') {
      systemPrompt = `You are an expert Third-Party Risk Management analyst. Analyze assessment responses and provide a risk score from 0-100 with detailed findings. Return JSON with fields: score (0-100), risk_level (critical/high/medium/low), summary (2-3 sentences), findings (array of strings).`;
      userPrompt = `Analyze this vendor assessment: ${JSON.stringify(vendor)}`;
    }

    console.log(`Processing ${type} analysis for vendor: ${vendor?.name}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded. Please try again later." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "AI credits exhausted. Please add more credits." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    let result;
    try {
      result = JSON.parse(content);
    } catch {
      result = { raw: content };
    }

    console.log(`Analysis complete for ${vendor?.name}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-risk function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
