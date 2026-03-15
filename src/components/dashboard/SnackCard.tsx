import { useState } from 'react';
import { RefreshCw, Cookie, Edit3 } from 'lucide-react';
import { SnackMeal, MenuItem } from '@/types/meal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CustomInputDialog } from './CustomInputDialog';

interface SnackCardProps {
  snack: SnackMeal;
  onRegenerateSnack?: () => void;
  onRegenerateSingleItem?: (itemIndex: number) => void;
  onCustomInput?: (itemIndex: number, customItem: MenuItem) => void;
}

const snackTypeLabels: Record<string, string> = {
  snack_morning: '오전 간식',
  snack_afternoon: '오후 간식',
  snack_evening: '야식',
};

const snackTypeColors: Record<string, string> = {
  snack_morning: 'bg-orange-100 text-orange-700',
  snack_afternoon: 'bg-pink-100 text-pink-700',
  snack_evening: 'bg-purple-100 text-purple-700',
};

export function SnackCard({ snack, onRegenerateSnack, onRegenerateSingleItem, onCustomInput }: SnackCardProps) {
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const handleOpenCustomDialog = (itemIndex: number) => {
    setCurrentItemIndex(itemIndex);
    setCustomDialogOpen(true);
  };

  const handleCustomSave = (customItem: MenuItem) => {
    if (onCustomInput) {
      onCustomInput(currentItemIndex, customItem);
    }
  };

  return (
    <>
      <div className="meal-card relative group bg-card/60">
        {/* 간식 타입 뱃지 */}
        <div className="flex items-center justify-between mb-2">
          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', snackTypeColors[snack.type])}>
            {snackTypeLabels[snack.type] || '간식'}
          </span>
          
          {onRegenerateSnack && (
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-smooth"
              onClick={onRegenerateSnack}
              title="전체 재생성"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* 간식 메뉴 리스트 */}
        <div className="space-y-1">
          {snack.items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-secondary/50 transition-smooth group/item"
            >
              <div className="flex items-center gap-1.5">
                <Cookie className="w-3.5 h-3.5 text-muted-foreground" />
                <span className={cn('text-xs', item.isCustom && 'text-primary')}>
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100">
                {onCustomInput && (
                  <button
                    onClick={() => handleOpenCustomDialog(index)}
                    className="p-1 rounded hover:bg-secondary transition-smooth"
                    title="직접입력"
                  >
                    <Edit3 className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
                {onRegenerateSingleItem && (
                  <button
                    onClick={() => onRegenerateSingleItem(index)}
                    className="p-1 rounded hover:bg-secondary transition-smooth"
                    title="재생성"
                  >
                    <RefreshCw className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 칼로리 및 가격 정보 */}
        <div className="mt-3 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{snack.totalCalories}kcal</span>
            <span>{snack.totalCost.toLocaleString()}원</span>
          </div>
        </div>
      </div>

      <CustomInputDialog
        open={customDialogOpen}
        onOpenChange={setCustomDialogOpen}
        onSave={handleCustomSave}
        itemType="snack"
      />
    </>
  );
}
