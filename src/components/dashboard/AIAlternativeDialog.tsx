import { useState } from 'react';
import { 
  Sparkles, 
  Loader2,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAIMealGeneration } from '@/hooks/useAIMealGeneration';
import { MenuItem } from '@/types/meal';
import TextType from '@/components/ui/TextType';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { sanitizeMenuName } from '@/utils/sanitizeMenuName';

interface AIAlternativeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuItem: MenuItem;
  allergens: string[];
  category: 'rice' | 'soup' | 'side';
  budgetPerMeal: number;
  onSelect: (newItem: MenuItem) => void;
}

interface AlternativeMenu extends MenuItem {
  reason: string;
}

export function AIAlternativeDialog({
  open,
  onOpenChange,
  menuItem,
  allergens,
  category,
  budgetPerMeal,
  onSelect,
}: AIAlternativeDialogProps) {
  const [alternatives, setAlternatives] = useState<AlternativeMenu[] | null>(null);
  const { suggestAlternatives, isSuggesting } = useAIMealGeneration();

  const handleSuggest = async () => {
    const result = await suggestAlternatives(menuItem, allergens, category, budgetPerMeal);
    if (result) {
      // 메뉴명 앞 이모지 제거(매칭/복사 시 혼선 방지)
      setAlternatives(
        result.map((r) => ({
          ...r,
          name: sanitizeMenuName(r.name),
        }))
      );
    }
  };

  const handleSelect = (alt: AlternativeMenu) => {
    const newItem: MenuItem = {
      id: crypto.randomUUID(),
      name: sanitizeMenuName(alt.name),
      category: category === 'rice' ? 'rice' : category === 'soup' ? 'soup' : 'side',
      calories: alt.calories,
      protein: alt.protein,
      carbs: alt.carbs,
      fat: alt.fat,
      sodium: alt.sodium,
      cost: alt.cost,
      allergens: alt.allergens || [],
    };
    onSelect(newItem);
    onOpenChange(false);
    setAlternatives(null);
  };

  const categoryName = category === 'rice' ? '밥' : category === 'soup' ? '국/찌개' : '반찬';

  return (
    <Dialog open={open} onOpenChange={(v) => {
      onOpenChange(v);
      if (!v) setAlternatives(null);
    }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI 대체 메뉴 추천
          </DialogTitle>
        </DialogHeader>

        {/* 현재 메뉴 정보 */}
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="font-medium text-red-700">알레르기 주의 메뉴</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">{menuItem.name}</span>
            <span className="text-muted-foreground"> ({categoryName})</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {allergens.map((a) => (
              <Badge key={a} variant="destructive" className="text-xs">
                {a}
              </Badge>
            ))}
          </div>
        </div>

        {!alternatives ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground mb-4">
              AI가 알레르기를 피하면서 비슷한 영양가의<br />대체 메뉴를 추천합니다.
            </p>
            <Button 
              onClick={handleSuggest} 
              disabled={isSuggesting}
              className="gap-2"
            >
              {isSuggesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <TextType 
                    text={["AI 추천 중.", "AI 추천 중..", "AI 추천 중..."]}
                    typingSpeed={100}
                    deletingSpeed={50}
                    pauseDuration={200}
                    loop={true}
                    showCursor={false}
                  />
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  대체 메뉴 추천받기
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              아래 대체 메뉴 중 하나를 선택하세요:
            </p>
            {alternatives.map((alt, index) => (
              <SpotlightCard 
                key={index}
                spotlightColor="rgba(82, 183, 136, 0.5)"
                className="cursor-pointer"
              >
                <div
                onClick={() => handleSelect(alt)}
                  className="w-full p-4 rounded-lg border border-border bg-card/80 backdrop-blur-sm hover:border-primary/60 hover:shadow-lg transition-all text-left"
              >
                <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-base">{alt.name}</span>
                    <ArrowRight className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
                  <span>{alt.calories}kcal</span>
                  <span>·</span>
                  <span>단백질 {alt.protein}g</span>
                  <span>·</span>
                  <span>나트륨 {alt.sodium}mg</span>
                  <span>·</span>
                  <span>{alt.cost.toLocaleString()}원</span>
                </div>
                  <div className="flex items-start gap-1 text-xs text-green-600 font-medium">
                  <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{alt.reason}</span>
                  </div>
                </div>
              </SpotlightCard>
            ))}
            
            <Button 
              variant="outline" 
              onClick={handleSuggest} 
              disabled={isSuggesting}
              className="w-full gap-2 mt-2"
            >
              {isSuggesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  추천 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  다른 메뉴 추천받기
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
