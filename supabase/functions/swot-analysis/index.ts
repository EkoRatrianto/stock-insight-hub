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
    const { company, ticker, price, changePercent, sector } = await req.json();
    
    console.log('Generating SWOT analysis for:', ticker);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `Analyze ${company} (${ticker}) and generate a comprehensive SWOT analysis. 
    
Company Info:
- Ticker: ${ticker}
- Current Price: $${price || 'N/A'}
- Price Change: ${changePercent?.toFixed(2) || 'N/A'}%
- Sector: ${sector || 'Technology'}

Please provide a detailed SWOT analysis in the following JSON format:
{
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "opportunities": ["opportunity1", "opportunity2", "opportunity3"],
  "threats": ["threat1", "threat2", "threat3"],
  "summary": "A brief 2-3 sentence summary of the company's position"
}

Base your analysis on general knowledge about the company, its industry position, market trends, and competitive landscape. Be specific and insightful.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are a senior financial analyst specializing in equity research. Provide detailed, accurate SWOT analyses based on your knowledge of companies, markets, and industries. Always respond with valid JSON only, no markdown or additional text." 
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('AI Response:', content?.substring(0, 200));

    // Parse the JSON response
    let swotData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        swotData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse SWOT response:", parseError);
      // Provide fallback data
      swotData = {
        strengths: ["Strong market position", "Innovative product portfolio", "Solid financial performance"],
        weaknesses: ["Market concentration risk", "Regulatory challenges", "Competition pressure"],
        opportunities: ["Emerging market expansion", "New product development", "Strategic partnerships"],
        threats: ["Economic uncertainty", "Technological disruption", "Changing consumer preferences"],
        summary: `${company} maintains a competitive position in the ${sector || 'technology'} sector with both opportunities and challenges ahead.`
      };
    }

    return new Response(JSON.stringify(swotData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in swot-analysis function:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
