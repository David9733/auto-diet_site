import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MenuItem } from '@/types/meal';
import { sanitizeMenuName } from '@/utils/sanitizeMenuName';

interface CustomInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: MenuItem) => void;
  itemType: 'rice' | 'soup' | 'sideDish' | 'snack';
  currentItem?: MenuItem;
}

export function CustomInputDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  itemType,
  currentItem 
}: CustomInputDialogProps) {
  const [name, setName] = useState(currentItem?.name || '');
  const [calories, setCalories] = useState(currentItem?.calories?.toString() || '100');
  const [cost, setCost] = useState(currentItem?.cost?.toString() || '500');
  const [sodium, setSodium] = useState(currentItem?.sodium?.toString() || '200');

  const handleSave = () => {
    const categoryMap: Record<string, 'rice' | 'soup' | 'side'> = {
      rice: 'rice',
      soup: 'soup',
      sideDish: 'side',
      snack: 'side',
    };

    const customItem: MenuItem = {
      id: `custom-${Date.now()}`,
      name: sanitizeMenuName(name) || '직접 입력',
      category: categoryMap[itemType],
      calories: Number(calories) || 100,
      protein: 5,
      carbs: 20,
      fat: 3,
      sodium: Number(sodium) || 200,
      allergens: [],
      cost: Number(cost) || 500,
      isCustom: true,
    };

    onSave(customItem);
    onOpenChange(false);
    
    // Reset form
    setName('');
    setCalories('100');
    setCost('500');
    setSodium('200');
  };

  const getTitle = () => {
    switch (itemType) {
      case 'rice': return '밥 직접 입력';
      case 'soup': return '국/찌개 직접 입력';
      case 'sideDish': return '반찬 직접 입력';
      case 'snack': return '간식 직접 입력';
      default: return '직접 입력';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>메뉴명</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="메뉴명을 입력하세요"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>칼로리(kcal)</Label>
              <Input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                min={0}
              />
            </div>
            
            <div className="space-y-2">
              <Label>나트륨(mg)</Label>
              <Input
                type="number"
                value={sodium}
                onChange={(e) => setSodium(e.target.value)}
                min={0}
              />
            </div>
            
            <div className="space-y-2">
              <Label>원가(원)</Label>
              <Input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                min={0}
                step={100}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSave}>
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
