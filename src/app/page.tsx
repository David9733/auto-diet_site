'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import { generateWeekMealPlan, prefetchFoodData } from '@/utils/mealGenerator';
import { getWeekMenuNames } from '@/utils/menuDuplicationChecker';
import { createPastedWeekPlan, getWeekPlanClipboard, shiftWeekMealPlanDates } from '@/utils/mealPlanClipboard';
import { enrichWeekNutrition, migrateLocalStorageToDatabase } from '@/services/nutritionEnricher';
import { enrichWeekCost } from '@/services/costEnricher';
import { useMealPlanStorage } from '@/hooks/useMealPlanStorage';
import { useAuth } from '@/hooks/useAuth';
import { 
  Calendar, Utensils, TrendingDown, ShieldCheck, Sparkles, Save, LogOut, ClipboardPaste, BookOpenText, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  const router = useRouter();
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [weekPlans, setWeekPlans] = useState<WeekMealPlanType[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [savedPlansDialogOpen, setSavedPlansDialogOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const isLoadingDataRef = useRef(false);

  /**
   * 영양/원가 보강은 백그라운드에서 오래 걸릴 수 있습니다.
   * - 사용자가 로그아웃하거나
   * - 새로 식단을 다시 생성하는 순간
   * 이전 작업 결과가 setWeekPlans로 화면을 다시 "식단 화면"으로 덮어쓰지 않도록
   * jobId(취소 토큰)로 결과 반영을 차단합니다.
   */
  const enrichJobIdRef = useRef(0);
  const userRef = useRef(user);
  const { toast } = useToast();
  const { saveMealPlans, isSaving } = useMealPlanStorage(user?.id);

  useEffect(() => {
    userRef.current = user;

    // 로그아웃/세션 만료 시점에 진행 중 보강 작업은 모두 취소
    if (!loading && !user) {
      enrichJobIdRef.current += 1;
    }
  }, [user, loading]);

  useEffect(() => {
    // ✅ 소개(Welcome) 페이지는 비로그인도 진입 가능
    // 다만 "식단 작성/불러오기/Start" 같은 실제 기능 진입은 클릭 시점에 로그인 유도
    if (!loading && !user) {
      // 로그아웃/세션 만료 시, 에디터/다이얼로그/식단 상태를 안전하게 초기화
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
      router.push('/auth');
      return;
    }
    action();
  };

  // LocalStorage → DB 마이그레이션 (한 번만 실행)
  useEffect(() => {
    const migrate = async () => {
      if (!user) return;
      
      const migrationKey = 'nutrition_migration_done_v1';
      const migrationDone = localStorage.getItem(migrationKey);
      
      if (!migrationDone) {
        console.log('🔄 영양 데이터 마이그레이션 시작...');
        try {
          const stats = await migrateLocalStorageToDatabase();
          if (stats.success > 0) {
            console.log(`✅ ${stats.success}개 항목 DB로 마이그레이션 완료`);
            toast({
              title: "데이터 마이그레이션 완료",
              description: `${stats.success}개 영양 정보가 데이터베이스로 이전되었습니다.`,
            });
          }
          localStorage.setItem(migrationKey, 'true');
        } catch (error) {
          console.error('마이그레이션 실패:', error);
        }
      }
    };
    
    migrate();
  }, [user, toast]);

  // API 데이터 프리페치 (앱 초기화 시)
  useEffect(() => {
    const loadFoodData = async () => {
      // state(isLoadingData)를 deps에 넣으면, 완료 후 false로 바뀌는 타이밍에 다시 실행되어 반복 호출될 수 있습니다.
      // ref를 가드로 사용해 "1회만" 실행되도록 보장합니다.
      if (!user || isLoadingDataRef.current) return;
      
      isLoadingDataRef.current = true;
      setIsLoadingData(true);
      try {
        console.log('🔄 음식 영양정보 데이터 로딩 중...');
        await prefetchFoodData();
        console.log('✅ 음식 데이터 로드 완료');
        
        toast({
          title: "데이터 로드 완료",
          description: "최신 음식 영양정보를 불러왔습니다.",
        });
      } catch (error) {
        console.warn('⚠️ API 데이터 로드 실패, 기본 데이터 사용', error);
        // 에러가 발생해도 기본 샘플 데이터로 동작하므로 사용자에게는 알리지 않음
      } finally {
        setIsLoadingData(false);
        isLoadingDataRef.current = false;
      }
    };

    loadFoodData();
  }, [user, toast]);

  const handleGenerate = async (weeks: number) => {
    // 새 생성 시작마다 jobId를 발급합니다. (이전 백그라운드 보강은 자동 취소)
    const jobId = ++enrichJobIdRef.current;
    setIsGenerating(true);
    
    try {
      // 시뮬레이션된 생성 딜레이
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newPlans: WeekMealPlanType[] = [];
      const startDate = new Date();
      // 월간(4주) 범위 중복 방지용: 이번 생성 루프에서 선택된 "반찬(밥/국/김치 제외)" 이름을 누적
      const monthMenus = new Set<string>();
      
      // 순차적으로 생성하여 인접 주차 중복 방지 (하드코딩 데이터 사용)
      for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(weekStart.getDate() + (i * 7));
        
        // 이전 주차 메뉴 전달 (있는 경우)
        const prevWeekPlan = i > 0 ? newPlans[i - 1] : undefined;
        
        const weekPlan = generateWeekMealPlan(i + 1, settings, weekStart, prevWeekPlan, undefined, monthMenus);
        newPlans.push(weekPlan);
        // 이번 주에서 사용된 메뉴를 월간 Set에 합침 (다음 주 생성 시 중복 방지)
        getWeekMenuNames(weekPlan).forEach((name) => monthMenus.add(name));
      }
      
      setWeekPlans(newPlans);
      setIsGenerating(false);
      
      toast({
        title: "식단 생성 완료!",
        description: `${weeks}주 식단이 자동 생성되었습니다. 영양/원가 정보를 보강하는 중...`,
      });
      
      // 백그라운드에서 영양 + 원가 정보 보강 (비동기)
      enrichDataInBackground(newPlans, jobId);
      
    } catch (error) {
      console.error('식단 생성 오류:', error);
      setIsGenerating(false);
      toast({
        title: "식단 생성 실패",
        description: "식단 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 백그라운드에서 영양 + 원가 정보 보강
  const enrichDataInBackground = async (plans: WeekMealPlanType[], jobId: number) => {
    const canceled = () => jobId !== enrichJobIdRef.current || !userRef.current;

    try {
      // 1단계: 영양 정보 보강
      console.log('🔄 FDA API로 영양 정보 보강 시작...');
      
      const nutritionEnrichedPlans = await Promise.all(
        plans.map(plan => enrichWeekNutrition(plan))
      );
      
      if (canceled()) return;
      setWeekPlans(nutritionEnrichedPlans);
      
      toast({
        title: "영양 정보 업데이트 완료!",
        description: "FDA API 데이터로 정확한 칼로리/나트륨 정보가 반영되었습니다. 원가 정보를 업데이트하는 중...",
      });
      
      console.log('✅ 영양 정보 보강 완료');
      
      // 2단계: 원가 정보 보강
      console.log('🔄 katOnline API로 원가 정보 보강 시작...');
      
      const fullyEnrichedPlans = await Promise.all(
        nutritionEnrichedPlans.map(plan => enrichWeekCost(plan))
      );
      
      if (canceled()) return;
      setWeekPlans(fullyEnrichedPlans);
      
      toast({
        title: "원가 정보 업데이트 완료!",
        description: "실시간 도매시장 시세로 정확한 원가가 반영되었습니다.",
      });
      
      console.log('✅ 원가 정보 보강 완료');
      
    } catch (error) {
      if (canceled()) return;
      console.warn('⚠️ 정보 보강 실패:', error);
      // 실패해도 기존 식단은 유지됨
      toast({
        title: "정보 업데이트 실패",
        description: "기본 정보로 표시됩니다.",
        variant: "default",
      });
    }
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
    // 로그아웃 시점에 진행 중 보강 작업은 모두 취소(완료돼도 결과 반영 안 함)
    enrichJobIdRef.current += 1;

    // 모바일(특히 카카오톡 인앱)에서는 signOut 직후 상태 반영이 늦을 수 있어
    // push 대신 replace + refresh로 세션/렌더를 한 번 더 안정화합니다.
    await signOut();

    // 화면도 즉시 소개 화면 상태로 정리
    setWeekPlans([]);
    setShowEditor(false);
    setSavedPlansDialogOpen(false);
    setIsGenerating(false);

    // 로그아웃 후에는 로그인 화면이 아니라 소개(메인) 페이지로 이동
    router.replace('/');
    router.refresh();
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
    // 우선순위: 사용자가 설정에서 선택한 시작일 → 현재 보유한 식단 중 가장 빠른 시작일
    if (settings.startDate) return settings.startDate;
    if (plans.length === 0) return new Date().toISOString().split('T')[0];
    return plans.reduce((min, p) => (p.startDate < min ? p.startDate : min), plans[0].startDate);
  };

  /**
   * 주차 번호 + 날짜를 함께 재정렬합니다.
   * - weekNumber: 1..N
   * - 날짜: baseStartDate 기준으로 (i * 7일) 간격으로 이동
   *   (mealGenerator가 주차 간격을 7일로 잡고 있어서, 5일 운영이어도 주차 간격은 7일 유지)
   */
  const normalizeWeekPlans = (plans: WeekMealPlanType[]) => {
    // 사용자가 주차 순서를 바꿀 수 있으므로, 여기서는 "현재 배열 순서"를 주차 순서로 봅니다.
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
    // 히스토리에서 불러온 경우는 날짜 기준으로 1..N주차를 맞추는 게 자연스럽습니다.
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

  const handleGoHome = () => {
    setWeekPlans([]);
    setShowEditor(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
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
      <Header onLogoClick={handleGoHome}>
        <Button variant="ghost" size="sm" onClick={() => router.push('/contact')} className="gap-2">
          <Mail className="w-4 h-4" />
          문의
        </Button>
        <Button variant="ghost" size="sm" onClick={() => router.push('/blog')} className="gap-2">
          <BookOpenText className="w-4 h-4" />
          블로그
        </Button>
        {user ? (
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            로그아웃
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => router.push('/auth')}>
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
          <div className="space-y-6">
            {/* 설정 패널 */}
            <div className="w-full">
              <SettingsPanel
                settings={settings}
                onSettingsChange={setSettings}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            </div>

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

            {/* 식단표 */}
            <div className="w-full">
              {weekPlans.length === 0 ? (
                <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
                  <Sparkles className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">식단을 생성해보세요</h3>
                  <p className="text-sm text-muted-foreground">
                    위 패널에서 설정을 조정하고 생성 버튼을 클릭하세요
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
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

