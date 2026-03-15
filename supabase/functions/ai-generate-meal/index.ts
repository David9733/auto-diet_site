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
    const { settings, mealType, dayOfWeek } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `당신은 한국 급식 영양사 전문 AI입니다. 
주어진 설정에 맞춰 급식 메뉴를 생성해주세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "rice": { "name": "밥 이름", "calories": 숫자, "protein": 숫자, "carbs": 숫자, "fat": 숫자, "sodium": 숫자, "cost": 숫자, "allergens": ["알레르기1"] },
  "soup": { "name": "국 이름", "calories": 숫자, "protein": 숫자, "carbs": 숫자, "fat": 숫자, "sodium": 숫자, "cost": 숫자, "allergens": ["알레르기1"] },
  "sideDishes": [
    { "name": "반찬1", "calories": 숫자, "protein": 숫자, "carbs": 숫자, "fat": 숫자, "sodium": 숫자, "cost": 숫자, "allergens": [] },
    { "name": "반찬2", "calories": 숫자, "protein": 숫자, "carbs": 숫자, "fat": 숫자, "sodium": 숫자, "cost": 숫자, "allergens": [] },
    { "name": "반찬3", "calories": 숫자, "protein": 숫자, "carbs": 숫자, "fat": 숫자, "sodium": 숫자, "cost": 숫자, "allergens": [] },
    { "name": "반찬4", "calories": 숫자, "protein": 숫자, "carbs": 숫자, "fat": 숫자, "sodium": 숫자, "cost": 숫자, "allergens": [] }
  ]
}

영양 기준:
- 한 끼 칼로리: 500-700kcal
- 나트륨: 800mg 이하
- 단백질: 15-25g
- 탄수화물: 60-90g
- 지방: 15-25g

알레르기 표시: 달걀, 우유, 대두, 밀, 고등어, 새우, 돼지고기, 닭고기, 쇠고기, 오징어 등`;

    const userPrompt = `다음 조건에 맞는 ${dayOfWeek} ${mealType === 'breakfast' ? '아침' : mealType === 'lunch' ? '점심' : '저녁'} 급식 메뉴를 생성해주세요:

- 1인분 예산: ${settings.budgetPerMeal}원
- 원가율: ${settings.costRatio}%
- 반찬 수: ${settings.sideDishCount}개
- 주의 알레르기: ${settings.watchAllergens?.join(', ') || '없음'}

${settings.watchAllergens?.length > 0 ? `주의: ${settings.watchAllergens.join(', ')} 알레르기 유발 식재료는 피해주세요.` : ''}

다양하고 균형 잡힌 한식 메뉴를 생성해주세요.`;

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
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    const content = data.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    
    const mealData = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ meal: mealData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-generate-meal:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
