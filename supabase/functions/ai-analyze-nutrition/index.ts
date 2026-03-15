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
    const { weekPlan, settings } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // 식단 요약 생성
    const mealSummary = weekPlan.days.map((day: any) => {
      if (day.isNotOperating) return `${day.dayOfWeek}: 운영안함`;
      
      const meals = day.meals.map((meal: any) => {
        const items = [meal.rice.name, meal.soup.name, ...meal.sideDishes.map((s: any) => s.name)];
        return `${meal.type === 'breakfast' ? '아침' : meal.type === 'lunch' ? '점심' : '저녁'}: ${items.join(', ')} (${meal.totalCalories}kcal, 나트륨 ${meal.totalSodium}mg, 원가 ${meal.totalCost}원)`;
      }).join('\n');
      
      return `${day.dayOfWeek}:\n${meals}`;
    }).join('\n\n');

    const systemPrompt = `당신은 한국 급식 영양 전문가 AI입니다.
주어진 주간 식단을 분석하고 개선점을 제안해주세요.

반드시 아래 JSON 형식으로 응답하세요:
{
  "overallScore": 숫자(1-100),
  "summary": "전반적인 평가 (2-3문장)",
  "nutritionAnalysis": {
    "calories": { "status": "적정|과다|부족", "message": "설명" },
    "protein": { "status": "적정|과다|부족", "message": "설명" },
    "sodium": { "status": "적정|과다|부족", "message": "설명" },
    "variety": { "status": "좋음|보통|부족", "message": "설명" }
  },
  "improvements": [
    { "priority": "high|medium|low", "category": "영양|다양성|원가|알레르기", "suggestion": "구체적인 개선 제안" }
  ],
  "positives": ["잘된 점 1", "잘된 점 2"]
}`;

    const userPrompt = `다음 주간 급식 식단을 분석해주세요:

설정 정보:
- 1인분 예산: ${settings.budgetPerMeal}원
- 원가율 목표: ${settings.costRatio}%
- 주의 알레르기: ${settings.watchAllergens?.join(', ') || '없음'}

주간 식단:
${mealSummary}

영양 균형, 메뉴 다양성, 원가 효율성, 알레르기 안전성 측면에서 분석하고 개선점을 제안해주세요.`;

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
        temperature: 0.6,
        max_tokens: 1500,
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
    
    const analysis = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-analyze-nutrition:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
