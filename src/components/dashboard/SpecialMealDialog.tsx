import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CuisineType } from '@/types/meal';

interface SpecialMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (cuisineType: CuisineType) => void;
}

// 특별식 이모지는 "종류 선택" UI에서만 노출 (메뉴명 매칭/복사 혼선 방지)
const cuisineOptions: { value: CuisineType; label: string; emoji: string }[] = [
  { value: 'japanese', label: '일식', emoji: '🍱' },
  { value: 'chinese', label: '중식', emoji: '🥟' },
  { value: 'western', label: '양식', emoji: '🍝' },
  { value: 'snack', label: '분식', emoji: '🍢' },
];

export function SpecialMealDialog({ open, onOpenChange, onSelect }: SpecialMealDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>특별식 종류 선택</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-3 py-4">
          {cuisineOptions.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => {
                onSelect(option.value);
                onOpenChange(false);
              }}
            >
              <span className="text-2xl leading-none">{option.emoji}</span>
              <span>{option.label}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
