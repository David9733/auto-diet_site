import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { SettingsPanel } from '@/components/dashboard/SettingsPanel';
import { WeeklyMealPlan } from '@/components/dashboard/WeeklyMealPlan';
import { SavedPlansDialog } from '@/components/dashboard/SavedPlansDialog';
import { WelcomeScreen } from '@/components/dashboard/WelcomeScreen';
import { HistoryDialog } from '@/components/dashboard/HistoryDialog';
import { ExportDialog } from '@/components/dashboard/ExportDialog';
import { AIAnalysisDialog } from '@/components/dashboard/AIAnalysisDialog';
import { StoreSettings, WeekMealPlan as WeekMealPlanType } from '@/types/meal';
import { generateWeekMealPlan } from '@/utils/mealGenerator';
import { getWeekMenuNames } from '@/utils/menuDuplicationChecker';
import { createPastedWeekPlan, getWeekPlanClipboard, shiftWeekMealPlanDates } from '@/utils/mealPlanClipboard';
import { useMealPlanStorage } from '@/hooks/useMealPlanStorage';
import { useAuth } from '@/hooks/useAuth';
import { 
  Calendar, Utensils, TrendingDown, ShieldCheck, Sparkles, Save, LogOut, ClipboardPaste, BookOpenText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import TextType from '@/components/ui/TextType';

const defaultSettings: StoreSettings = {
  id: 'store-1',
  storeName: '우리 급식소',
  mealsPerDay: 3,
  mealCombination: 'all',
  singleMealType: 'lunch',
  daysPerWeek: 5,
  sideDishCount: 4,
  sideDishCountAuto: true,
  servingCount: 100,
  budgetPerMeal: 5000,
  costRatio: 35,
  snackMorning: false,
  snackAfternoon: false,
  snackEvening: false,
};

export default function Index() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [weekPlans, setWeekPlans] = useState<WeekMealPlanType[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [savedPlansDialogOpen, setSavedPlansDialogOpen] = useState(false);
  const { toast } = useToast();
  const { saveMealPlans, isSaving } = useMealPlanStorage(user?.id);

  useEffect(() => {
    // ✅ 소개(Welcome) 페이지는 비로그인도 진입 가능
    // 실제 기능(식단 작성/불러오기)은 클릭 시점에 로그인 유도
    if (!loading && !user) {
      setShowEditor(false);
      setWeekPlans([]);
      setSavedPlansDialogOpen(false);
    }
  }, [user, loading]);

  const requireAuth = (action: () => void) => {
    if (loading) return;
    if (!user) {
      toast({
        title: '로그인 필요',
        description: '계속하려면 로그인 또는 회원가입을 해주세요.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    action();
  };

  const handleGenerate = async (weeks: number) => {
    setIsGenerating(true);
    
    // 시뮬레이션된 생성 딜레이
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newPlans: WeekMealPlanType[] = [];
    const startDate = new Date();
    // 월간(4주) 범위 중복 방지용: 이번 생성 루프에서 선택된 "반찬(밥/국/김치 제외)" 이름을 누적
    const monthMenus = new Set<string>();
    
    // 순차적으로 생성하여 인접 주차 중복 방지
    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + (i * 7));
      
      // 이전 주차 메뉴 전달 (있는 경우)
      const prevWeekPlan = i > 0 ? newPlans[i - 1] : undefined;
      
      const weekPlan = generateWeekMealPlan(i + 1, settings, weekStart, prevWeekPlan, undefined, monthMenus);
      newPlans.push(weekPlan);
      getWeekMenuNames(weekPlan).forEach((name) => monthMenus.add(name));
    }
    
    setWeekPlans(newPlans);
    setIsGenerating(false);
    
    toast({
      title: "식단 생성 완료!",
      description: `${weeks}주 식단이 자동 생성되었습니다.`,
    });
  };

  const handleSave = async () => {
    if (weekPlans.length === 0) {
      toast({
        title: "저장할 식단이 없습니다",
        description: "먼저 식단을 생성해주세요.",
        variant: "destructive",
      });
      return;
    }
    await saveMealPlans(weekPlans, settings);
  };

  const handleLogout = async () => {
    await signOut();
    // 로그아웃 후에는 로그인 화면이 아니라 소개(메인) 페이지로 이동
    navigate('/');
  };

  const handleUpdateWeekPlan = (index: number, updatedPlan: WeekMealPlanType) => {
    setWeekPlans(prev => prev.map((plan, i) => (i === index ? updatedPlan : plan)));
  };

  const addDays = (dateIso: string, days: number) => {
    const d = new Date(dateIso);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const getBaseStartDate = (plans: WeekMealPlanType[]) => {
    if (settings.startDate) return settings.startDate;
    if (plans.length === 0) return new Date().toISOString().split('T')[0];
    return plans.reduce((min, p) => (p.startDate < min ? p.startDate : min), plans[0].startDate);
  };

  const normalizeWeekPlans = (plans: WeekMealPlanType[]) => {
    const baseStart = getBaseStartDate(plans);

    return plans.map((p, i) => {
      const desiredStart = addDays(baseStart, i * 7);
      const deltaDays = Math.round(
        (new Date(desiredStart).getTime() - new Date(p.startDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      const shifted = shiftWeekMealPlanDates(p, deltaDays);

      return {
        ...shifted,
        weekNumber: i + 1,
      };
    });
  };

  const sortByStartDate = (plans: WeekMealPlanType[]) =>
    [...plans].sort((a, b) => a.startDate.localeCompare(b.startDate));

  const moveWeekPlan = (fromIndex: number, toIndex: number) => {
    setWeekPlans(prev => {
      if (fromIndex < 0 || fromIndex >= prev.length) return prev;
      if (toIndex < 0 || toIndex >= prev.length) return prev;
      const next = [...prev];
      const tmp = next[fromIndex];
      next[fromIndex] = next[toIndex];
      next[toIndex] = tmp;
      return normalizeWeekPlans(next);
    });
  };

  // 시작 날짜를 변경하면, 기존 식단의 "날짜"도 새 시작일 기준으로 재배치
  useEffect(() => {
    if (!settings.startDate) return;
    if (weekPlans.length === 0) return;

    setWeekPlans(prev => normalizeWeekPlans(prev));
    toast({
      title: '시작 날짜 적용',
      description: '기존 식단 날짜가 새 시작일 기준으로 조정되었습니다.',
    });
    // startDate가 바뀔 때만 실행 (weekPlans를 deps에 넣으면 불필요한 반복 조정이 발생할 수 있음)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.startDate]);

  const handleDeleteWeekPlan = (weekId: string) => {
    setWeekPlans(prev => normalizeWeekPlans(prev.filter(p => p.id !== weekId)));
    toast({
      title: '삭제 완료',
      description: '주차 식단이 삭제되었습니다.',
    });
  };

  const handleLoadPlans = (plans: WeekMealPlanType[]) => {
    setWeekPlans(normalizeWeekPlans(sortByStartDate(plans)));
  };

  const handlePasteWeekPlan = () => {
    const clipboardPlan = getWeekPlanClipboard();
    if (!clipboardPlan) {
      toast({
        title: '붙여넣기 실패',
        description: '복사된 식단이 없습니다. 히스토리에서 먼저 복사해주세요.',
        variant: 'destructive',
      });
      return;
    }

    const nextWeekNumber = weekPlans.length + 1;
    const baseStart = getBaseStartDate(weekPlans);
    const desiredStartDate = addDays(baseStart, (nextWeekNumber - 1) * 7);
    const pasted = createPastedWeekPlan(clipboardPlan, nextWeekNumber, desiredStartDate);

    setWeekPlans(prev => normalizeWeekPlans([...prev, pasted]));
    setShowEditor(true);

    toast({
      title: '붙여넣기 완료',
      description: `${nextWeekNumber}주차 식단이 새로 생성되었습니다. (원본은 그대로 유지됩니다)`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-soft mb-4">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <TextType 
            text={["시스템 로딩 중.", "시스템 로딩 중..", "시스템 로딩 중..."]}
            typingSpeed={120}
            deletingSpeed={60}
            pauseDuration={300}
            loop={true}
            showCursor={true}
            cursorCharacter="|"
            className="text-lg font-medium text-foreground"
          />
        </div>
      </div>
    );
  }

  // 통계 계산
  const totalMeals = weekPlans.reduce(
    (sum, week) => sum + week.days.reduce((daySum, day) => daySum + day.meals.length, 0),
    0
  );
  
  const totalSnacks = weekPlans.reduce(
    (sum, week) => sum + week.days.reduce((daySum, day) => daySum + (day.snacks?.length || 0), 0),
    0
  );
  
  const warningMeals = weekPlans.reduce(
    (sum, week) => sum + week.days.reduce(
      (daySum, day) => daySum + day.meals.filter(m => m.hasNutritionWarning || m.hasCostWarning).length,
      0
    ),
    0
  );

  const totalCost = weekPlans.reduce(
    (sum, week) => sum + week.days.reduce(
      (daySum, day) => daySum + day.meals.reduce((mealSum, meal) => mealSum + meal.totalCost, 0),
      0
    ),
    0
  );

  return (
    <div className="min-h-screen gradient-hero">
      <Header>
          <Button variant="ghost" size="sm" onClick={() => navigate('/blog')} className="gap-2">
            <BookOpenText className="w-4 h-4" />
            블로그
          </Button>
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              로그아웃
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
              로그인 / 회원가입
            </Button>
          )}
        </Header>
        
        <main className="container py-8">
        {/* 첫 화면: 웰컴 스크린 */}
        {weekPlans.length === 0 && !showEditor && (
          <WelcomeScreen
            onNewPlan={() => requireAuth(() => setShowEditor(true))}
            onLoadSaved={() => requireAuth(() => setSavedPlansDialogOpen(true))}
          />
        )}

        {/* 저장된 식단 불러오기 다이얼로그 (숨김) */}
        <SavedPlansDialog 
          userId={user?.id} 
          onLoadPlan={(plans) => {
            handleLoadPlans(plans);
            setShowEditor(true);
            setSavedPlansDialogOpen(false);
          }}
          open={savedPlansDialogOpen}
          onOpenChange={setSavedPlansDialogOpen}
        />

        {/* 통계 카드 */}
        {weekPlans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="생성된 식단"
              value={`${weekPlans.length}주`}
              subtitle={`${weekPlans.reduce((sum, w) => sum + w.days.length, 0)}일`}
              icon={Calendar}
              variant="default"
            />
            <StatsCard
              title="총 끼니 수"
              value={totalMeals}
              subtitle={totalSnacks > 0 ? `+ 간식 ${totalSnacks}회` : "끼니"}
              icon={Utensils}
              variant="success"
            />
            <StatsCard
              title="검토 필요"
              value={warningMeals}
              subtitle="영양/원가 경고"
              icon={ShieldCheck}
              variant={warningMeals > 0 ? 'warning' : 'success'}
            />
            <StatsCard
              title="예상 식재료비"
              value={`${(totalCost * settings.servingCount).toLocaleString()}원`}
              subtitle={`1인 평균 ${Math.round(totalCost / Math.max(totalMeals, 1)).toLocaleString()}원`}
              icon={TrendingDown}
              variant="default"
            />
          </div>
        )}

        {/* 메인 컨텐츠 */}
        {(showEditor || weekPlans.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 설정 패널 */}
            <div className="lg:col-span-1">
              <SettingsPanel
                settings={settings}
                onSettingsChange={setSettings}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            </div>

            {/* 식단표 */}
            <div className="lg:col-span-3">
              {weekPlans.length === 0 ? (
                <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
                  <Sparkles className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">식단을 생성해보세요</h3>
                  <p className="text-sm text-muted-foreground">
                    왼쪽 패널에서 설정을 조정하고 생성 버튼을 클릭하세요
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* 히스토리/붙여넣기(항상) + 내보내기/저장(식단 있을 때만) */}
                  <div className="flex flex-wrap justify-end gap-2">
                    <HistoryDialog userId={user?.id} onLoadPlan={handleLoadPlans} />
                    <Button variant="outline" onClick={handlePasteWeekPlan} className="gap-2">
                      <ClipboardPaste className="w-4 h-4" />
                      붙여넣기
                    </Button>

                    {weekPlans.length > 0 && (
                      <>
                        <AIAnalysisDialog weekPlans={weekPlans} settings={settings} />
                        <ExportDialog weekPlans={weekPlans} settings={settings} />
                        <Button 
                          onClick={handleSave} 
                          disabled={isSaving}
                          className="gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {isSaving ? '저장 중...' : '식단 저장'}
                        </Button>
                      </>
                    )}
                  </div>
                  
                  {weekPlans.map((weekPlan, index) => (
                    <WeeklyMealPlan
                      key={weekPlan.id}
                      weekPlan={weekPlan}
                      settings={settings}
                      onUpdateWeekPlan={(plan) => handleUpdateWeekPlan(index, plan)}
                      onDeleteWeekPlan={() => handleDeleteWeekPlan(weekPlan.id)}
                      canMoveUp={index > 0}
                      canMoveDown={index < weekPlans.length - 1}
                      onMoveUp={() => moveWeekPlan(index, index - 1)}
                      onMoveDown={() => moveWeekPlan(index, index + 1)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
