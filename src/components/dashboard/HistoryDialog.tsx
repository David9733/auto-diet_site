import { useState, useEffect, useRef } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  History, 
  Trash2, 
  Download, 
  Calendar, 
  Copy, 
  Eye, 
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
// AlertDialog는 중첩 다이얼로그에서 오버레이/포커스 잠금 이슈가 발생해 사용하지 않습니다.
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { WeekMealPlan, DayMealPlan } from '@/types/meal';
import { useToast } from '@/hooks/use-toast';
import { setWeekPlanClipboard } from '@/utils/mealPlanClipboard';

interface SavedPlan {
  id: string;
  week_number: number;
  start_date: string;
  end_date: string;
  plan_data: unknown;
  created_at: string;
  updated_at: string;
}

interface HistoryDialogProps {
  userId?: string;
  onLoadPlan: (plans: WeekMealPlan[]) => void;
}

export function HistoryDialog({ userId, onLoadPlan }: HistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewPlan, setPreviewPlan] = useState<SavedPlan | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const deletingRef = useRef(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  /**
   * 일부 환경에서 Radix Dialog/AlertDialog가 닫힌 뒤에도
   * body/html에 남은 pointer-events/overflow 락 때문에 화면이 "클릭 불가"가 되는 케이스가 있습니다.
   * (대개 중첩 다이얼로그/빠른 open-close 타이밍에서 발생)
   *
   * - 열린 포탈이 하나도 없을 때만(= 다른 다이얼로그가 열려 있지 않을 때만) 안전하게 락을 해제합니다.
   * - 애니메이션 종료 타이밍도 고려해 0ms + 250ms 두 번 시도합니다.
   */
  const cleanupRadixInteractionLock = () => {
    if (typeof document === 'undefined') return;

    /**
     * 주의: Toast 같은 다른 Radix 컴포넌트도 data-state="open"을 사용합니다.
     * 삭제 성공/실패 토스트가 떠 있는 동안에는 포탈 안에 open 상태가 존재하므로,
     * 단순히 [data-state="open"]만으로 판단하면 "다이얼로그가 닫혔는데도" cleanup이 스킵되어
     * body/html에 남은 pointer-events/overflow 잠금이 풀리지 않는 문제가 생길 수 있습니다.
     *
     * 따라서 "실제 다이얼로그(History Dialog/Preview Dialog/AlertDialog)"가 열려있는지로만 판단합니다.
     */
    const hasOpenDialogLayer = !!document.querySelector(
      [
        // Dialog
        '[data-radix-portal] [role="dialog"][data-state="open"]',
        // AlertDialog
        '[data-radix-portal] [role="alertdialog"][data-state="open"]',
      ].join(',')
    );
    if (hasOpenDialogLayer) return;

    // 강제 잠금 해제 (남아있는 경우에만 영향)
    document.body.style.pointerEvents = '';
    document.documentElement.style.pointerEvents = '';
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    // 포커스가 남아있어 키보드/클릭이 이상해지는 케이스 방지
    const active = document.activeElement as HTMLElement | null;
    active?.blur?.();
  };

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
      // 첫 번째 그룹을 기본으로 열어둠
      if (data && data.length > 0) {
        const firstDate = format(new Date(data[0].created_at), 'yyyy-MM-dd');
        setExpandedGroups({ [firstDate]: true });
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      fetchSavedPlans();
    }
  }, [open, userId]);

  // 컴포넌트가 언마운트될 때도 안전하게 잠금 해제 시도 (라우팅/조건부 렌더링 등)
  useEffect(() => {
    return () => {
      setTimeout(cleanupRadixInteractionLock, 0);
      setTimeout(cleanupRadixInteractionLock, 250);
    };
  }, []);

  const handleLoad = (plan: SavedPlan) => {
    onLoadPlan([plan.plan_data as WeekMealPlan]);
    setOpen(false);
    toast({
      title: '식단 불러오기 완료',
      description: `${plan.week_number}주차 식단을 불러왔습니다.`,
    });
  };

  const handleCopy = async (plan: SavedPlan) => {
    try {
      // DB에 복제 저장이 아니라, "붙여넣기"를 위한 클립보드 저장입니다.
      // (사용자는 복사 → 붙여넣기 → '새로운 식단 생성(독립적)' 흐름을 원함)
      setWeekPlanClipboard(plan.plan_data as WeekMealPlan);
      toast({
        title: '복사 완료',
        description: '이제 상단의 "붙여넣기"로 새 주차 식단을 만들 수 있어요.',
      });
    } catch (error) {
      console.error('식단 클립보드 복사 실패:', error);
      toast({
        title: '복사 실패',
        description: '식단 복사 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  /**
   * 삭제는 "성공/실패"를 명확히 알 수 있게 boolean을 반환합니다.
   * (실패했는데 다이얼로그만 닫히면 사용자는 '삭제가 안 됨'으로 느끼기 쉬움)
   */
  const handleDelete = async (planId: string): Promise<boolean> => {
    deletingRef.current = true;
    setDeletingPlanId(planId);

    try {
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
        return false;
      }

      setSavedPlans(prev => prev.filter(p => p.id !== planId));
      toast({
        title: '삭제 완료',
        description: '식단이 삭제되었습니다.',
      });

      return true;
    } catch (error) {
      console.error('식단 삭제 중 예외:', error);
      toast({
        title: '삭제 실패',
        description: '삭제 중 예기치 못한 오류가 발생했습니다.',
        variant: 'destructive',
      });
      return false;
    } finally {
      deletingRef.current = false;
      setDeletingPlanId(null);
    }
  };

  const toggleGroup = (date: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  // Group plans by created_at date
  const groupedPlans = savedPlans.reduce((acc, plan) => {
    const date = format(new Date(plan.created_at), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(plan);
    return acc;
  }, {} as Record<string, SavedPlan[]>);

  // Get plan summary for preview
  const getPlanSummary = (plan: SavedPlan) => {
    const planData = plan.plan_data as WeekMealPlan;
    const days = planData.days || [];
    const totalMeals = days.reduce((sum, day) => sum + (day.meals?.length || 0), 0);
    const operatingDays = days.filter(day => !day.isNotOperating).length;
    return { totalMeals, operatingDays, days };
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          // 히스토리 다이얼로그가 닫힐 때, 내부 중첩 다이얼로그 상태를 함께 정리하지 않으면
          // Radix의 포인터/포커스 잠금이 남아 "다른 버튼이 안 눌리는" 현상이 발생할 수 있음
          if (!nextOpen) {
            setPreviewPlan(null);
            setDeleteConfirm(null);
            // 닫힘 직후 + 애니메이션 종료 후 한 번 더 정리
            setTimeout(cleanupRadixInteractionLock, 0);
            setTimeout(cleanupRadixInteractionLock, 250);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <History className="w-4 h-4" />
            히스토리
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              식단 히스토리
              {savedPlans.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {savedPlans.length}개 저장됨
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2">
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">불러오는 중...</div>
            ) : savedPlans.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">저장된 식단이 없습니다.</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  식단을 생성하고 저장하면 여기에 표시됩니다.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedPlans).map(([date, plans]) => (
                  <Collapsible 
                    key={date} 
                    open={expandedGroups[date]} 
                    onOpenChange={() => toggleGroup(date)}
                  >
                    <CollapsibleTrigger asChild>
                      <button className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(date), 'yyyy년 M월 d일 (E)', { locale: ko })}
                          </span>
                          <Badge variant="outline" className="ml-2">
                            {plans.length}개
                          </Badge>
                        </div>
                        {expandedGroups[date] ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 space-y-2">
                      {plans.map((plan) => {
                        const summary = getPlanSummary(plan);
                        const timeAgo = formatDistanceToNow(new Date(plan.created_at), { 
                          addSuffix: true, 
                          locale: ko 
                        });
                        
                        return (
                          <div
                            key={plan.id}
                            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{plan.week_number}주차 식단</span>
                                <span className="text-xs text-muted-foreground">
                                  {timeAgo}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {format(new Date(plan.start_date), 'M/d')} - {format(new Date(plan.end_date), 'M/d')}
                                <span className="mx-2">·</span>
                                {summary.operatingDays}일 운영
                                <span className="mx-2">·</span>
                                {summary.totalMeals}끼
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setPreviewPlan(plan)}
                                title="미리보기"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleCopy(plan)}
                                title="복사"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() => handleLoad(plan)}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                불러오기
                              </Button>
                              {deleteConfirm === plan.id ? (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8"
                                    disabled={!!deletingPlanId}
                                    onClick={() => setDeleteConfirm(null)}
                                  >
                                    취소
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-8"
                                    disabled={!!deletingPlanId}
                                    onClick={async () => {
                                      if (deletingRef.current) return;
                                      const ok = await handleDelete(plan.id);
                                      if (!ok) return;
                                      setDeleteConfirm(null);

                                      // 삭제 후 간헐적으로 잠금이 남는 케이스 대비
                                      setTimeout(cleanupRadixInteractionLock, 0);
                                      setTimeout(cleanupRadixInteractionLock, 250);
                                    }}
                                  >
                                    {deletingPlanId ? '삭제 중...' : '삭제'}
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => setDeleteConfirm(plan.id)}
                                  title="삭제"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 미리보기 다이얼로그 */}
      <Dialog open={!!previewPlan} onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setPreviewPlan(null);
          // 중첩 다이얼로그가 닫힐 때도 포인터/스크롤 잠금이 남는 케이스 방지
          setTimeout(cleanupRadixInteractionLock, 0);
          setTimeout(cleanupRadixInteractionLock, 250);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              {previewPlan?.week_number}주차 식단 미리보기
            </DialogTitle>
          </DialogHeader>
          
          {previewPlan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-muted-foreground">기간</div>
                  <div className="font-medium">
                    {format(new Date(previewPlan.start_date), 'yyyy.M.d')} - {format(new Date(previewPlan.end_date), 'yyyy.M.d')}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-muted-foreground">생성일</div>
                  <div className="font-medium">
                    {format(new Date(previewPlan.created_at), 'yyyy.M.d HH:mm')}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {((previewPlan.plan_data as WeekMealPlan).days || []).map((day: DayMealPlan) => (
                  <div key={day.id} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{day.dayOfWeek}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(day.date), 'M/d')}
                      </span>
                    </div>
                    {day.isNotOperating ? (
                      <div className="text-sm text-muted-foreground italic">운영 안함</div>
                    ) : (
                      <div className="space-y-1">
                        {day.meals.map((meal) => (
                          <div key={meal.id} className="text-sm">
                            <span className="text-muted-foreground">
                              {meal.type === 'breakfast' ? '아침' : meal.type === 'lunch' ? '점심' : '저녁'}:
                            </span>
                            <span className="ml-2">
                              {meal.rice.name}, {meal.soup.name}, {meal.sideDishes.map(s => s.name).join(', ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setPreviewPlan(null)}>
                  닫기
                </Button>
                <Button onClick={() => {
                  handleLoad(previewPlan);
                  setPreviewPlan(null);
                }}>
                  <Download className="w-4 h-4 mr-1" />
                  불러오기
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/*
        ✅ 삭제 UX를 AlertDialog(포탈/오버레이) 대신 "인라인 2단계"로 처리합니다.
        - 중첩 Radix Dialog/AlertDialog 환경에서 오버레이만 남아 화면이 먹통되는 현상을 근본적으로 차단
        - 사용자는 '삭제' → (취소/삭제)로 명확히 동작을 확인 가능
      */}
    </>
  );
}
