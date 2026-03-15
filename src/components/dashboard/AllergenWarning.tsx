import { useState } from 'react';
import { Meal, MenuItem } from '@/types/meal';
import { validateAllergens, getWatchedAllergenInfo, AllergenWarning } from '@/utils/allergenValidator';
import { ShieldAlert, Sparkles, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { AIAlternativeDialog } from './AIAlternativeDialog';

interface AllergenWarningBadgeProps {
  meal: Meal;
  watchAllergens: string[];
  budgetPerMeal?: number;
  onReplaceItem?: (itemType: 'rice' | 'soup' | 'sideDish', dishIndex: number | null, newItem: MenuItem) => void;
}

export function AllergenWarningBadge({ meal, watchAllergens, budgetPerMeal = 5000, onReplaceItem }: AllergenWarningBadgeProps) {
  const validation = validateAllergens(meal, watchAllergens);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    item: MenuItem;
    allergens: string[];
    category: 'rice' | 'soup' | 'side';
    dishIndex?: number;
  } | null>(null);

  if (!validation.hasWarning) {
    return null;
  }

  const handleAISuggest = (warning: AllergenWarning) => {
    // Find which item contains this allergen
    const allItems = [
      { item: meal.rice, category: 'rice' as const, index: null },
      { item: meal.soup, category: 'soup' as const, index: null },
      ...meal.sideDishes.map((item, idx) => ({ item, category: 'side' as const, index: idx }))
    ];

    const affectedItem = allItems.find(({ item }) =>
      item.allergens.some(a => 
        warning.allergen.includes(a) || a.includes(warning.allergen)
      )
    );

    if (affectedItem) {
      setSelectedItem({
        item: affectedItem.item,
        allergens: [warning.allergen],
        category: affectedItem.category,
        dishIndex: affectedItem.index ?? undefined
      });
      setAiDialogOpen(true);
    }
  };

  const handleSelectAlternative = (newItem: MenuItem) => {
    if (selectedItem && onReplaceItem) {
      const itemType = selectedItem.category === 'side' ? 'sideDish' : selectedItem.category;
      onReplaceItem(itemType, selectedItem.dishIndex ?? null, newItem);
    }
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="p-1.5 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors animate-pulse"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-500">
              <ShieldAlert className="w-5 h-5" />
              <h4 className="font-semibold text-sm">알레르기 주의</h4>
            </div>

            <div className="space-y-2">
              {validation.warnings.map((warning, index) => {
                const allergenInfo = getWatchedAllergenInfo(warning.allergen);
                return (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {/* 알레르기 이모지는 사용자 식별에 도움이 되므로 표시합니다. */}
                        {allergenInfo?.icon && (
                          <span className="text-base leading-none">{allergenInfo.icon}</span>
                        )}
                        <span className="font-medium text-sm text-red-600">
                          {warning.allergen}
                        </span>
                      </div>
                      {onReplaceItem && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1 text-primary hover:text-primary"
                          onClick={() => handleAISuggest(warning)}
                        >
                          <Sparkles className="w-3 h-3" />
                          대체 추천
                        </Button>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      포함 메뉴: {warning.menuItems.join(', ')}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground pt-2 border-t border-border">
              설정에서 주의 알레르기를 변경할 수 있습니다.
            </p>
          </div>
        </PopoverContent>
      </Popover>

      {selectedItem && (
        <AIAlternativeDialog
          open={aiDialogOpen}
          onOpenChange={setAiDialogOpen}
          menuItem={selectedItem.item}
          allergens={selectedItem.allergens}
          category={selectedItem.category}
          budgetPerMeal={budgetPerMeal}
          onSelect={handleSelectAlternative}
        />
      )}
    </>
  );
}

interface AllergenTagsProps {
  allergens: string[];
  watchAllergens?: string[];
  maxShow?: number;
}

export function AllergenTags({ allergens, watchAllergens = [], maxShow = 3 }: AllergenTagsProps) {
  const [showMore, setShowMore] = useState(false);
  
  if (allergens.length === 0) return null;

  const isWatched = (allergen: string) => {
    return watchAllergens.some(wa => 
      allergen.includes(wa) || wa.includes(allergen)
    );
  };

  const visibleAllergens = allergens.slice(0, maxShow);
  const remainingAllergens = allergens.slice(maxShow);
  const remainingCount = allergens.length - maxShow;

  return (
    <div className="flex flex-col gap-1">
    <div className="flex flex-wrap gap-1">
      {visibleAllergens.map((allergen) => (
        <span
          key={allergen}
          className={cn(
            'px-2 py-0.5 text-xs rounded-full',
            isWatched(allergen)
              ? 'bg-red-500/20 text-red-600 font-medium border border-red-500/30'
              : 'bg-destructive/10 text-destructive'
          )}
        >
          {allergen}
        </span>
      ))}
      {remainingCount > 0 && (
          <button 
            onClick={() => setShowMore(!showMore)}
            className="px-2 py-0.5 bg-muted hover:bg-muted/80 text-muted-foreground text-xs rounded-full transition-colors cursor-pointer flex items-center gap-1"
          >
          +{remainingCount}
            <ChevronDown className={cn("w-3 h-3 transition-transform", showMore && "rotate-180")} />
          </button>
        )}
      </div>
      {showMore && remainingAllergens.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {remainingAllergens.map((allergen) => (
            <span
              key={allergen}
              className={cn(
                'px-2 py-0.5 text-xs rounded-full',
                isWatched(allergen)
                  ? 'bg-red-500/20 text-red-600 font-medium border border-red-500/30'
                  : 'bg-destructive/10 text-destructive'
              )}
            >
              {allergen}
        </span>
          ))}
        </div>
      )}
    </div>
  );
}
