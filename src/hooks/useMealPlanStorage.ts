import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StoreSettings, WeekMealPlan } from '@/types/meal';
import { useToast } from '@/hooks/use-toast';

export function useMealPlanStorage(userId?: string) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const { toast } = useToast();

  const saveSettings = async (settings: StoreSettings) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .upsert({
          user_id: userId,
          store_name: settings.storeName,
          meals_per_day: settings.mealsPerDay,
          days_per_week: settings.daysPerWeek,
          side_dish_count: settings.sideDishCount,
          serving_count: settings.servingCount,
          budget_per_meal: settings.budgetPerMeal,
          cost_ratio: settings.costRatio,
          snack_morning: settings.snackMorning,
          snack_afternoon: settings.snackAfternoon,
          snack_evening: settings.snackEvening,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  const saveMealPlan = async (
    weekPlan: WeekMealPlan, 
    settingsId: string
  ) => {
    if (!userId) return null;
    
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert({
          user_id: userId,
          settings_id: settingsId,
          week_number: weekPlan.weekNumber,
          start_date: weekPlan.startDate,
          end_date: weekPlan.endDate,
          plan_data: weekPlan as any,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "저장 완료",
        description: `${weekPlan.weekNumber}주차 식단이 저장되었습니다.`,
      });

      return data;
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        title: "저장 실패",
        description: "식단 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const saveMealPlans = async (
    weekPlans: WeekMealPlan[], 
    settings: StoreSettings
  ) => {
    if (!userId) {
      toast({
        title: "로그인 필요",
        description: "저장하려면 먼저 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      // 먼저 설정 저장
      const savedSettings = await saveSettings(settings);
      if (!savedSettings) throw new Error('Failed to save settings');
      
      // 각 주차별 식단 저장
      const planPromises = weekPlans.map(plan => 
        supabase
          .from('meal_plans')
          .insert({
            user_id: userId,
            settings_id: savedSettings.id,
            week_number: plan.weekNumber,
            start_date: plan.startDate,
            end_date: plan.endDate,
            plan_data: plan as any,
          })
      );

      await Promise.all(planPromises);

      toast({
        title: "저장 완료",
        description: `${weekPlans.length}주 식단이 데이터베이스에 저장되었습니다.`,
      });
    } catch (error) {
      console.error('Error saving meal plans:', error);
      toast({
        title: "저장 실패",
        description: "식단 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const loadSavedPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*, store_settings(*)')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSavedPlans(data || []);
      return data;
    } catch (error) {
      console.error('Error loading meal plans:', error);
      toast({
        title: "불러오기 실패",
        description: "저장된 식단을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMealPlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      toast({
        title: "삭제 완료",
        description: "식단이 삭제되었습니다.",
      });

      await loadSavedPlans();
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      toast({
        title: "삭제 실패",
        description: "식단 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return {
    isSaving,
    isLoading,
    savedPlans,
    saveSettings,
    saveMealPlan,
    saveMealPlans,
    loadSavedPlans,
    deleteMealPlan,
  };
}
