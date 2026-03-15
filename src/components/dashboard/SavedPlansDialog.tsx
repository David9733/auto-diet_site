import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { History, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { WeekMealPlan } from '@/types/meal';
import { useToast } from '@/hooks/use-toast';

interface SavedPlan {
  id: string;
  week_number: number;
  start_date: string;
  end_date: string;
  plan_data: unknown;
  created_at: string;
}

interface SavedPlansDialogProps {
  userId?: string;
  onLoadPlan: (plans: WeekMealPlan[]) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function SavedPlansDialog({ userId, onLoadPlan, open: controlledOpen, onOpenChange, trigger }: SavedPlansDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSavedPlans = async () => {
    if (!userId) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: '불러오기 실패',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setSavedPlans(data as SavedPlan[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      fetchSavedPlans();
    }
  }, [open, userId]);

  const handleLoad = (plan: SavedPlan) => {
    onLoadPlan([plan.plan_data as WeekMealPlan]);
    setOpen(false);
    toast({
      title: '식단 불러오기 완료',
      description: `${plan.week_number}주차 식단을 불러왔습니다.`,
    });
  };

  const handleDelete = async (planId: string) => {
    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', planId);

    if (error) {
      toast({
        title: '삭제 실패',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setSavedPlans(prev => prev.filter(p => p.id !== planId));
      toast({
        title: '삭제 완료',
        description: '식단이 삭제되었습니다.',
      });
    }
  };

  // Group plans by created_at date
  const groupedPlans = savedPlans.reduce((acc, plan) => {
    const date = format(new Date(plan.created_at), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(plan);
    return acc;
  }, {} as Record<string, SavedPlan[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <History className="w-4 h-4" />
            저장된 식단
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>저장된 식단 목록</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">불러오는 중...</div>
        ) : savedPlans.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            저장된 식단이 없습니다.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPlans).map(([date, plans]) => (
              <div key={date}>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  {format(new Date(date), 'yyyy년 M월 d일 (E)', { locale: ko })}
                </h4>
                <div className="space-y-2">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div>
                        <div className="font-medium">{plan.week_number}주차 식단</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(plan.start_date), 'M/d')} - {format(new Date(plan.end_date), 'M/d')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLoad(plan)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          불러오기
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(plan.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
