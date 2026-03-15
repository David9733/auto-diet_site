import { WeekMealPlan, StoreSettings, Meal, MenuItem, SnackMeal } from '@/types/meal';
import { DayColumn } from './DayColumn';
import { generateDayMealPlan, regenerateMeal, regenerateSideDish, regenerateRice, regenerateSoup, regenerateSnackItem, regenerateSingleSnackItem, generateSpecialMeal, addSideDish, removeSideDish } from '@/utils/mealGenerator';
import { useState } from 'react';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface WeeklyMealPlanProps {
  weekPlan: WeekMealPlan;
  settings: StoreSettings;
  onUpdateWeekPlan: (plan: WeekMealPlan) => void;
  onDeleteWeekPlan?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function WeeklyMealPlan({
  weekPlan,
  settings,
  onUpdateWeekPlan,
  onDeleteWeekPlan,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: WeeklyMealPlanProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleRegenerateDay = (dayIndex: number) => {
    const day = weekPlan.days[dayIndex];
    const newDay = generateDayMealPlan(day.date, day.dayOfWeek, settings);
    const newDays = [...weekPlan.days];
    newDays[dayIndex] = newDay;
    onUpdateWeekPlan({ ...weekPlan, days: newDays });
  };

  const handleRegenerateMeal = (dayIndex: number, mealIndex: number) => {
    const meal = weekPlan.days[dayIndex].meals[mealIndex];
    // 특별식인 경우 해당 카테고리로 재생성
    const newMeal = meal.isSpecialMeal && meal.cuisineType 
      ? generateSpecialMeal(meal.type as 'breakfast' | 'lunch' | 'dinner', meal.cuisineType, settings)
      : regenerateMeal(meal, settings);
    const newDays = [...weekPlan.days];
    newDays[dayIndex] = { ...newDays[dayIndex], meals: newDays[dayIndex].meals.map((m, i) => (i === mealIndex ? newMeal : m)) };
    onUpdateWeekPlan({ ...weekPlan, days: newDays });
  };

  const handleRegenerateDish = (dayIndex: number, mealIndex: number, dishIndex: number) => {
    const newMeal = regenerateSideDish(weekPlan.days[dayIndex].meals[mealIndex], dishIndex, settings);
    const newDays = [...weekPlan.days];
    newDays[dayIndex] = { ...newDays[dayIndex], meals: newDays[dayIndex].meals.map((m, i) => (i === mealIndex ? newMeal : m)) };
    onUpdateWeekPlan({ ...weekPlan, days: newDays });
  };

  const handleRegenerateRice = (dayIndex: number, mealIndex: number) => {
    const newMeal = regenerateRice(weekPlan.days[dayIndex].meals[mealIndex], settings);
    const newDays = [...weekPlan.days];
    newDays[dayIndex] = { ...newDays[dayIndex], meals: newDays[dayIndex].meals.map((m, i) => (i === mealIndex ? newMeal : m)) };
    onUpdateWeekPlan({ ...weekPlan, days: newDays });
  };

  const handleRegenerateSoup = (dayIndex: number, mealIndex: number) => {
    const newMeal = regenerateSoup(weekPlan.days[dayIndex].meals[mealIndex], settings);
    const newDays = [...weekPlan.days];
    newDays[dayIndex] = { ...newDays[dayIndex], meals: newDays[dayIndex].meals.map((m, i) => (i === mealIndex ? newMeal : m)) };
    onUpdateWeekPlan({ ...weekPlan, days: newDays });
  };

  const handleRegenerateSnack = (dayIndex: number, snackIndex: number) => {
    const day = weekPlan.days[dayIndex];
    if (!day.snacks) return;
    const newSnack = regenerateSnackItem(day.snacks[snackIndex], settings.watchAllergens);
    const newDays = [...weekPlan.days];
    newDays[dayIndex] = { ...newDays[dayIndex], snacks: day.snacks.map((s, i) => (i === snackIndex ? newSnack : s)) };
    onUpdateWeekPlan({ ...weekPlan, days: newDays });
  };

  const handleRegenerateSingleSnackItem = (dayIndex: number, snackIndex: number, itemIndex: number) => {
    const day = weekPlan.days[dayIndex];
    if (!day.snacks) return;
    const newSnack = regenerateSingleSnackItem(day.snacks[snackIndex], itemIndex, settings.watchAllergens);
    const newDays = [...weekPlan.days];
    newDays[dayIndex] = { ...newDays[dayIndex], snacks: day.snacks.map((s, i) => (i === snackIndex ? newSnack : s)) };
    onUpdateWeekPlan({ ...weekPlan, days: newDays });
  };

  const handleToggleNotOperating = (dayIndex: number) => {
    const newDays = [...weekPlan.days];
    newDays[dayIndex] = { 
      ...newDays[dayIndex], 
      isNotOperating: !newDays[dayIndex].isNotOperating 
    };
    onUpdateWeekPlan({ ...weekPlan, days: newDays });
  };

  const handleUpdateMeal = (dayIndex: number, mealIndex: number, updatedMeal: Meal) => {
    const newDays = [...weekPlan.days];
    newDays[dayIndex] = { 
      ...newDays[dayIndex], 
      meals: newDays[dayIndex].meals.map((m, i) => (i === mealIndex ? updatedMeal : m)) 
    };
    onUpdateWeekPlan({ ...weekPlan, days: newDays });
  };

  const handleCustomInput = (dayIndex: number, mealIndex: number, itemType: 'rice' | 'soup' | 'sideDish', dishIndex: number | null, customItem: MenuItem) => {
    const meal = weekPlan.days[dayIndex].meals[mealIndex];
    let updatedMeal: Meal;

    if (itemType === 'rice') {
      updatedMeal = { ...meal, rice: { ...customItem, isCustom: true } };
    } else if (itemType === 'soup') {
      updatedMeal = { ...meal, soup: { ...customItem, isCustom: true } };
    } else {
      const newSideDishes = [...meal.sideDishes];
      if (dishIndex !== null) {
        newSideDishes[dishIndex] = { ...customItem, isCustom: true };
      }
      updatedMeal = { ...meal, sideDishes: newSideDishes };
    }

    // Recalculate totals
    const totalCalories = updatedMeal.rice.calories + updatedMeal.soup.calories + 
      updatedMeal.sideDishes.reduce((sum, d) => sum + d.calories, 0);
    const totalCost = updatedMeal.rice.cost + updatedMeal.soup.cost + 
      updatedMeal.sideDishes.reduce((sum, d) => sum + d.cost, 0);
    const totalSodium = updatedMeal.rice.sodium + updatedMeal.soup.sodium + 
      updatedMeal.sideDishes.reduce((sum, d) => sum + d.sodium, 0);
    const totalProtein = updatedMeal.rice.protein + updatedMeal.soup.protein + 
      updatedMeal.sideDishes.reduce((sum, d) => sum + d.protein, 0);
    const totalCarbs = updatedMeal.rice.carbs + updatedMeal.soup.carbs + 
      updatedMeal.sideDishes.reduce((sum, d) => sum + d.carbs, 0);
    const totalFat = updatedMeal.rice.fat + updatedMeal.soup.fat + 
      updatedMeal.sideDishes.reduce((sum, d) => sum + d.fat, 0);

    const costLimit = settings.budgetPerMeal * (settings.costRatio / 100);

    updatedMeal = {
      ...updatedMeal,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalCost,
      totalSodium,
      hasCostWarning: totalCost > costLimit,
      hasNutritionWarning: totalSodium > 2000 || totalCalories > 900,
    };

    handleUpdateMeal(dayIndex, mealIndex, updatedMeal);
  };

  const handleSnackCustomInput = (dayIndex: number, snackIndex: number, itemIndex: number, customItem: MenuItem) => {
    const day = weekPlan.days[dayIndex];
    if (!day.snacks) return;

    const snack = day.snacks[snackIndex];
    const newItems = [...snack.items];
    newItems[itemIndex] = { ...customItem, isCustom: true };

    const totalCalories = newItems.reduce((sum, item) => sum + item.calories, 0);
    const totalCost = newItems.reduce((sum, item) => sum + item.cost, 0);

    const updatedSnack: SnackMeal = {
      ...snack,
      items: newItems,
      totalCalories,
      totalCost,
    };

    const newDays = [...weekPlan.days];
    newDays[dayIndex] = { 
      ...newDays[dayIndex], 
      snacks: day.snacks.map((s, i) => (i === snackIndex ? updatedSnack : s)) 
    };
    onUpdateWeekPlan({ ...weekPlan, days: newDays });
  };

  const handleToggleSpecialMeal = (dayIndex: number, mealIndex: number, cuisineType?: 'japanese' | 'chinese' | 'western' | 'snack') => {
    const meal = weekPlan.days[dayIndex].meals[mealIndex];
    
    if (cuisineType) {
      // 특별식 타입 선택 시 해당 카테고리로 메뉴 재생성
      const newMeal = generateSpecialMeal(meal.type as 'breakfast' | 'lunch' | 'dinner', cuisineType, settings);
      handleUpdateMeal(dayIndex, mealIndex, newMeal);
    } else {
      // 토글 off
      const updatedMeal: Meal = {
        ...meal,
        isSpecialMeal: false,
        cuisineType: undefined,
      };
      handleUpdateMeal(dayIndex, mealIndex, updatedMeal);
    }
  };

  const handleAddSideDish = (dayIndex: number, mealIndex: number) => {
    const meal = weekPlan.days[dayIndex].meals[mealIndex];
    const newMeal = addSideDish(meal, settings);
    handleUpdateMeal(dayIndex, mealIndex, newMeal);
  };

  const handleRemoveSideDish = (dayIndex: number, mealIndex: number, dishIndex: number) => {
    const meal = weekPlan.days[dayIndex].meals[mealIndex];
    const newMeal = removeSideDish(meal, dishIndex, settings);
    handleUpdateMeal(dayIndex, mealIndex, newMeal);
  };

  const formatDateRange = () => {
    const start = new Date(weekPlan.startDate);
    const end = new Date(weekPlan.endDate);
    return `${start.getMonth() + 1}월 ${start.getDate()}일 - ${end.getMonth() + 1}월 ${end.getDate()}일`;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h3 className="text-base sm:text-lg font-semibold">{weekPlan.weekNumber}주차 식단</h3>
          <span className="text-xs sm:text-sm text-muted-foreground">{formatDateRange()}</span>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <div className="text-[11px] sm:text-xs text-muted-foreground italic">
            * 열량, 나트륨, 원가는 대략적인 수치입니다
          </div>
          {(onMoveUp || onMoveDown) && (
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onMoveUp}
                disabled={!canMoveUp}
                title="위로 이동"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onMoveDown}
                disabled={!canMoveDown}
                title="아래로 이동"
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
            </div>
          )}
          {onDeleteWeekPlan && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteOpen(true)}
              title="주차 식단 삭제"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max">
          {weekPlan.days.map((day, dayIndex) => (
            <DayColumn
              key={day.id}
              day={day}
              settings={settings}
              watchAllergens={settings.watchAllergens}
              onRegenerateDay={() => handleRegenerateDay(dayIndex)}
              onRegenerateMeal={(mealIndex) => handleRegenerateMeal(dayIndex, mealIndex)}
              onRegenerateDish={(mealIndex, dishIndex) => handleRegenerateDish(dayIndex, mealIndex, dishIndex)}
              onRegenerateRice={(mealIndex) => handleRegenerateRice(dayIndex, mealIndex)}
              onRegenerateSoup={(mealIndex) => handleRegenerateSoup(dayIndex, mealIndex)}
              onRegenerateSnack={(snackIndex) => handleRegenerateSnack(dayIndex, snackIndex)}
              onRegenerateSingleSnackItem={(snackIndex, itemIndex) => handleRegenerateSingleSnackItem(dayIndex, snackIndex, itemIndex)}
              onToggleNotOperating={() => handleToggleNotOperating(dayIndex)}
              onCustomInput={(mealIndex, itemType, dishIndex, customItem) => 
                handleCustomInput(dayIndex, mealIndex, itemType, dishIndex, customItem)
              }
              onSnackCustomInput={(snackIndex, itemIndex, customItem) =>
                handleSnackCustomInput(dayIndex, snackIndex, itemIndex, customItem)
              }
              onToggleSpecialMeal={(mealIndex, cuisineType) => 
                handleToggleSpecialMeal(dayIndex, mealIndex, cuisineType)
              }
              onAddSideDish={(mealIndex) => handleAddSideDish(dayIndex, mealIndex)}
              onRemoveSideDish={(mealIndex, dishIndex) => handleRemoveSideDish(dayIndex, mealIndex, dishIndex)}
            />
          ))}
        </div>
      </div>

      {/* 주차 삭제 확인 */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{weekPlan.weekNumber}주차 식단 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 주차 식단을 삭제하시겠습니까? 삭제하면 현재 화면에서 제거되며 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onDeleteWeekPlan?.();
                setDeleteOpen(false);
              }}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
