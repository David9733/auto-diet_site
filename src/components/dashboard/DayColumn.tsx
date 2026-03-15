import { RefreshCw, Ban } from 'lucide-react';
import { DayMealPlan, MenuItem, CuisineType, StoreSettings } from '@/types/meal';
import { MealCard } from './MealCard';
import { SnackCard } from './SnackCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DayColumnProps {
  day: DayMealPlan;
  settings: StoreSettings;
  watchAllergens?: string[];
  onRegenerateDay: () => void;
  onRegenerateMeal: (mealIndex: number) => void;
  onRegenerateDish: (mealIndex: number, dishIndex: number) => void;
  onRegenerateRice?: (mealIndex: number) => void;
  onRegenerateSoup?: (mealIndex: number) => void;
  onRegenerateSnack?: (snackIndex: number) => void;
  onRegenerateSingleSnackItem?: (snackIndex: number, itemIndex: number) => void;
  onToggleNotOperating?: () => void;
  onCustomInput?: (mealIndex: number, itemType: 'rice' | 'soup' | 'sideDish', dishIndex: number | null, customItem: MenuItem) => void;
  onSnackCustomInput?: (snackIndex: number, itemIndex: number, customItem: MenuItem) => void;
  onToggleSpecialMeal?: (mealIndex: number, cuisineType?: CuisineType) => void;
  onAddSideDish?: (mealIndex: number) => void;
  onRemoveSideDish?: (mealIndex: number, dishIndex: number) => void;
}

export function DayColumn({
  day,
  settings,
  watchAllergens = [],
  onRegenerateDay,
  onRegenerateMeal,
  onRegenerateDish,
  onRegenerateRice,
  onRegenerateSoup,
  onRegenerateSnack,
  onRegenerateSingleSnackItem,
  onToggleNotOperating,
  onCustomInput,
  onSnackCustomInput,
  onToggleSpecialMeal,
  onAddSideDish,
  onRemoveSideDish,
}: DayColumnProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="flex flex-col min-w-[240px] animate-fade-in">
      {/* 날짜 헤더 */}
      <div className="flex items-center justify-between p-3 bg-card rounded-t-xl border border-border/50 border-b-0">
        <div>
          <h4 className="text-sm font-semibold">{day.dayOfWeek}</h4>
          <p className="text-xs text-muted-foreground">{formatDate(day.date)}</p>
        </div>
        <div className="flex items-center gap-1">
          {onToggleNotOperating && (
            <Button
              variant={day.isNotOperating ? 'destructive' : 'ghost'}
              size="icon"
              onClick={onToggleNotOperating}
              className="h-8 w-8"
              title={day.isNotOperating ? '운영으로 변경' : '운영안함으로 변경'}
            >
              <Ban className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onRegenerateDay}
            className="h-8 w-8"
            disabled={day.isNotOperating}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 끼니 카드들 */}
      <div className={cn(
        'flex-1 p-2 space-y-2 bg-secondary/30 rounded-b-xl border border-border/50 border-t-0',
        day.isNotOperating && 'flex items-center justify-center'
      )}>
        {day.isNotOperating ? (
          <div className="text-center py-12">
            <Ban className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-lg font-medium text-muted-foreground">운영안함</p>
          </div>
        ) : (
          <>
            {day.meals.map((meal, mealIndex) => (
              <MealCard
                key={meal.id}
                meal={meal}
                settings={settings}
                watchAllergens={watchAllergens}
                onRegenerateMeal={() => onRegenerateMeal(mealIndex)}
                onRegenerateDish={(dishIndex) => onRegenerateDish(mealIndex, dishIndex)}
                onRegenerateRice={onRegenerateRice ? () => onRegenerateRice(mealIndex) : undefined}
                onRegenerateSoup={onRegenerateSoup ? () => onRegenerateSoup(mealIndex) : undefined}
                onCustomInput={onCustomInput ? (itemType, dishIndex, customItem) => 
                  onCustomInput(mealIndex, itemType, dishIndex, customItem) : undefined}
                onToggleSpecialMeal={onToggleSpecialMeal ? (cuisineType) =>
                  onToggleSpecialMeal(mealIndex, cuisineType) : undefined}
                onAddSideDish={onAddSideDish ? () => onAddSideDish(mealIndex) : undefined}
                onRemoveSideDish={onRemoveSideDish ? (dishIndex) => onRemoveSideDish(mealIndex, dishIndex) : undefined}
              />
            ))}
            
            {/* 간식 카드들 */}
            {day.snacks && day.snacks.length > 0 && (
              <>
                {day.snacks.map((snack, snackIndex) => (
                  <SnackCard
                    key={snack.id}
                    snack={snack}
                    onRegenerateSnack={onRegenerateSnack ? () => onRegenerateSnack(snackIndex) : undefined}
                    onRegenerateSingleItem={onRegenerateSingleSnackItem ? (itemIndex) => 
                      onRegenerateSingleSnackItem(snackIndex, itemIndex) : undefined}
                    onCustomInput={onSnackCustomInput ? (itemIndex, customItem) =>
                      onSnackCustomInput(snackIndex, itemIndex, customItem) : undefined}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
