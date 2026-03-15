import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { menuItem, allergens, category, budgetPerMeal } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `당신은 한국 급식 영양사 전문 AI입니다.
알레르기 문제가 있는 메뉴의 대체 메뉴를 추천해주세요.

반드시 아래 JSON 형식으로 3가지 대안을 제시하세요:
{
  "alternatives": [
    { "name": "대체메뉴1", "calories": 숫자, "protein": 숫자, "carbs": 숫자, "fat": 숫자, "sodium": 숫자, "cost": 숫자, "allergens": [], "reason": "추천 이유" },
    { "name": "대체메뉴2", "calories": 숫자, "protein": 숫자, "carbs": 숫자, "fat": 숫자, "sodium": 숫자, "cost": 숫자, "allergens": [], "reason": "추천 이유" },
    { "name": "대체메뉴3", "calories": 숫자, "protein": 숫자, "carbs": 숫자, "fat": 숫자, "sodium": 숫자, "cost": 숫자, "allergens": [], "reason": "추천 이유" }
  ]
}`;

    const categoryName = category === 'rice' ? '밥' : category === 'soup' ? '국/찌개' : '반찬';
    
    const userPrompt = `현재 메뉴: ${menuItem.name} (${categoryName})
문제가 되는 알레르기: ${allergens.join(', ')}
예산: ${budgetPerMeal}원

위 알레르기를 포함하지 않으면서, 비슷한 영양가와 가격대의 대체 ${categoryName} 메뉴 3가지를 추천해주세요.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    const content = data.choices[0].message.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    
    const alternatives = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(alternatives), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-suggest-alternative:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
