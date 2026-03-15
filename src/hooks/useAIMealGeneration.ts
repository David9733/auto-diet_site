import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StoreSettings, MenuItem } from '@/types/meal';
import { useToast } from '@/hooks/use-toast';
import { sanitizeMenuName } from '@/utils/sanitizeMenuName';

interface AlternativeMenu extends MenuItem {
  reason: string;
}

interface NutritionAnalysis {
  overallScore: number;
  summary: string;
  nutritionAnalysis: {
    calories: { status: string; message: string };
    protein: { status: string; message: string };
    sodium: { status: string; message: string };
    variety: { status: string; message: string };
  };
  improvements: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    suggestion: string;
  }>;
  positives: string[];
}

export function useAIMealGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { toast } = useToast();

  const generateMealWithAI = async (
    settings: StoreSettings,
    mealType: 'breakfast' | 'lunch' | 'dinner',
    dayOfWeek: string
  ) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-generate-meal', {
        body: { settings, mealType, dayOfWeek },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: 'AI 식단 생성 완료',
        description: `${dayOfWeek} ${mealType === 'breakfast' ? '아침' : mealType === 'lunch' ? '점심' : '저녁'} 메뉴가 생성되었습니다.`,
      });

      // AI가 메뉴명에 이모지를 붙여 보내는 경우가 있어, 앞쪽 이모지는 제거합니다.
      if (data?.meal) {
        const meal = data.meal;
        const sanitizeItem = (item: any) => ({
          ...item,
          name: sanitizeMenuName(item?.name),
        });

        return {
          ...meal,
          rice: sanitizeItem(meal.rice),
          soup: sanitizeItem(meal.soup),
          sideDishes: Array.isArray(meal.sideDishes) ? meal.sideDishes.map(sanitizeItem) : meal.sideDishes,
        };
      }

      return data.meal;
    } catch (error) {
      console.error('AI meal generation error:', error);
      toast({
        title: 'AI 생성 실패',
        description: error instanceof Error ? error.message : 'AI 식단 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const suggestAlternatives = async (
    menuItem: MenuItem,
    allergens: string[],
    category: 'rice' | 'soup' | 'side',
    budgetPerMeal: number
  ): Promise<AlternativeMenu[] | null> => {
    setIsSuggesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-suggest-alternative', {
        body: { menuItem, allergens, category, budgetPerMeal },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // AI가 메뉴명에 이모지를 붙여 보내는 경우가 있어, 앞쪽 이모지는 제거합니다.
      if (Array.isArray(data?.alternatives)) {
        return data.alternatives.map((a: any) => ({
          ...a,
          name: sanitizeMenuName(a?.name),
        }));
      }

      return data.alternatives;
    } catch (error) {
      console.error('AI suggestion error:', error);
      toast({
        title: '대체 메뉴 추천 실패',
        description: error instanceof Error ? error.message : 'AI 추천 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsSuggesting(false);
    }
  };

  const analyzeNutrition = async (
    weekPlan: any,
    settings: StoreSettings
  ): Promise<NutritionAnalysis | null> => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-analyze-nutrition', {
        body: { weekPlan, settings },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return data.analysis;
    } catch (error) {
      console.error('AI analysis error:', error);
      toast({
        title: '영양 분석 실패',
        description: error instanceof Error ? error.message : 'AI 분석 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isGenerating,
    isAnalyzing,
    isSuggesting,
    generateMealWithAI,
    suggestAlternatives,
    analyzeNutrition,
  };
}
