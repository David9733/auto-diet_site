import { useState } from 'react';
import { RefreshCw, CircleDollarSign, Flame, Droplets, Edit3, Star, Plus, Trash2 } from 'lucide-react';
import { Meal, MenuItem, CuisineType, StoreSettings } from '@/types/meal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CustomInputDialog } from './CustomInputDialog';
import { SpecialMealDialog } from './SpecialMealDialog';
import { NutritionDetails } from './NutritionDetails';
import { AllergenWarningBadge, AllergenTags } from './AllergenWarning';
import { CostDetails } from './CostDetails';
import { getCostSummary } from '@/utils/costValidator';

interface MealCardProps {
  meal: Meal;
  settings: StoreSettings;
  watchAllergens?: string[];
  onRegenerateMeal: () => void;
  onRegenerateDish: (index: number) => void;
  onRegenerateRice?: () => void;
  onRegenerateSoup?: () => void;
  onCustomInput?: (itemType: 'rice' | 'soup' | 'sideDish', dishIndex: number | null, customItem: MenuItem) => void;
  onToggleSpecialMeal?: (cuisineType?: CuisineType) => void;
  onAddSideDish?: () => void;
  onRemoveSideDish?: (index: number) => void;
}

const mealTypeLabels: Record<string, string> = {
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
};

const mealTypeColors: Record<string, string> = {
  breakfast: 'bg-amber-100 text-amber-700',
  lunch: 'bg-emerald-100 text-emerald-700',
  dinner: 'bg-indigo-100 text-indigo-700',
};

const cuisineTypeLabels: Record<string, string> = {
  japanese: '일식',
  chinese: '중식',
  western: '양식',
  snack: '분식',
};

const cuisineTypeColors: Record<string, string> = {
  japanese: 'bg-red-100 text-red-700',
  chinese: 'bg-yellow-100 text-yellow-700',
  western: 'bg-blue-100 text-blue-700',
  snack: 'bg-orange-100 text-orange-700',
};

export function MealCard({ meal, settings, watchAllergens = [], onRegenerateMeal, onRegenerateDish, onRegenerateRice, onRegenerateSoup, onCustomInput, onToggleSpecialMeal, onAddSideDish, onRemoveSideDish }: MealCardProps) {
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customItemType, setCustomItemType] = useState<'rice' | 'soup' | 'sideDish'>('rice');
  const [customDishIndex, setCustomDishIndex] = useState<number | null>(null);
  const [specialDialogOpen, setSpecialDialogOpen] = useState(false);

  const handleOpenCustomDialog = (itemType: 'rice' | 'soup' | 'sideDish', dishIndex: number | null = null) => {
    setCustomItemType(itemType);
    setCustomDishIndex(dishIndex);
    setCustomDialogOpen(true);
  };

  const handleCustomSave = (customItem: MenuItem) => {
    if (onCustomInput) {
      onCustomInput(customItemType, customDishIndex, customItem);
    }
  };

  // 현재 설정 기준으로 원가 경고 실시간 계산
  const costSummary = getCostSummary(meal, settings);
  const hasCostWarning = costSummary.warnings.some(w => w.severity === 'error');

  return (
    <>
      <div
        className={cn(
          'meal-card relative group',
          hasCostWarning && 'ring-2 ring-destructive/50',
          meal.isSpecialMeal && 'ring-2 ring-primary/50'
        )}
      >
        {/* 끼니 타입 뱃지 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', mealTypeColors[meal.type])}>
              {mealTypeLabels[meal.type]}
            </span>
            {meal.isSpecialMeal && meal.cuisineType && (
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', cuisineTypeColors[meal.cuisineType])}>
                {cuisineTypeLabels[meal.cuisineType]}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {/* 알레르기 경고 */}
            {watchAllergens.length > 0 && (
              <AllergenWarningBadge 
                meal={meal} 
                watchAllergens={watchAllergens}
                budgetPerMeal={settings.budgetPerMeal}
                onReplaceItem={onCustomInput}
              />
            )}
            
            {/* 영양 상세 정보 */}
            <NutritionDetails meal={meal} />
            
            {/* 원가 상세 정보 */}
            <CostDetails meal={meal} settings={settings} />
            
            {onToggleSpecialMeal && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'w-8 h-8 opacity-0 group-hover:opacity-100 transition-smooth',
                  meal.isSpecialMeal && 'opacity-100 text-primary'
                )}
                onClick={() => meal.isSpecialMeal ? onToggleSpecialMeal() : setSpecialDialogOpen(true)}
                title="특별식"
              >
                <Star className={cn('w-4 h-4', meal.isSpecialMeal && 'fill-primary')} />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-smooth"
              onClick={onRegenerateMeal}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 메뉴 리스트 */}
        <div className="space-y-1">
          {/* 밥 */}
          <div className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-secondary/50 transition-smooth group/rice">
            <div className="flex items-center gap-1.5">
              <span className={cn('text-xs font-medium', meal.rice.isCustom && 'text-primary')}>
                {meal.rice.name}
              </span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover/rice:opacity-100">
              {onCustomInput && (
                <button
                  onClick={() => handleOpenCustomDialog('rice')}
                  className="p-1 rounded hover:bg-secondary transition-smooth"
                >
                  <Edit3 className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
              {onRegenerateRice && (
                <button
                  onClick={onRegenerateRice}
                  className="p-1 rounded hover:bg-secondary transition-smooth"
                >
                  <RefreshCw className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* 국 */}
          {meal.soup.name !== '-' && (
            <div className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-secondary/50 transition-smooth group/soup">
              <div className="flex items-center gap-1.5">
                <span className={cn('text-xs font-medium', meal.soup.isCustom && 'text-primary')}>
                  {meal.soup.name}
                </span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover/soup:opacity-100">
                {onCustomInput && (
                  <button
                    onClick={() => handleOpenCustomDialog('soup')}
                    className="p-1 rounded hover:bg-secondary transition-smooth"
                  >
                    <Edit3 className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
                {onRegenerateSoup && (
                  <button
                    onClick={onRegenerateSoup}
                    className="p-1 rounded hover:bg-secondary transition-smooth"
                  >
                    <RefreshCw className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 반찬들 */}
          {meal.sideDishes.map((dish, index) => (
            <div
              key={dish.id}
              className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-secondary/50 transition-smooth group/dish"
            >
              <div className="flex items-center gap-1.5">
                <span className={cn('text-xs font-medium', dish.isCustom && 'text-primary')}>
                  {dish.name}
                </span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover/dish:opacity-100">
                {onCustomInput && (
                  <button
                    onClick={() => handleOpenCustomDialog('sideDish', index)}
                    className="p-1 rounded hover:bg-secondary transition-smooth"
                  >
                    <Edit3 className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
                <button
                  onClick={() => onRegenerateDish(index)}
                  className="p-1 rounded hover:bg-secondary transition-smooth"
                >
                  <RefreshCw className="w-3 h-3 text-muted-foreground" />
                </button>
                {onRemoveSideDish && meal.sideDishes.length > 1 && (
                  <button
                    onClick={() => onRemoveSideDish(index)}
                    className="p-1 rounded hover:bg-destructive/10 transition-smooth"
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* 반찬 추가 버튼 */}
          {onAddSideDish && (
            <button
              onClick={onAddSideDish}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-secondary/30 transition-smooth text-muted-foreground hover:text-primary"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-xs">반찬 추가</span>
            </button>
          )}
        </div>

        {/* 영양 정보 요약 */}
        <div className="mt-2.5 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Flame className="w-3 h-3" />
              <span>{meal.totalCalories}kcal</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="w-3 h-3" />
              <span>{meal.totalSodium}mg</span>
            </div>
            <div className="flex items-center gap-1">
              <CircleDollarSign className="w-3 h-3" />
              <span>{meal.totalCost.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        {/* 알레르기 표시 */}
        {meal.allergens.length > 0 && (
          <div className="mt-1.5">
            <AllergenTags 
              allergens={meal.allergens} 
              watchAllergens={watchAllergens}
              maxShow={4}
            />
          </div>
        )}
      </div>

      <CustomInputDialog
        open={customDialogOpen}
        onOpenChange={setCustomDialogOpen}
        onSave={handleCustomSave}
        itemType={customItemType}
      />

      <SpecialMealDialog
        open={specialDialogOpen}
        onOpenChange={setSpecialDialogOpen}
        onSelect={(cuisineType) => onToggleSpecialMeal?.(cuisineType)}
      />
    </>
  );
}
