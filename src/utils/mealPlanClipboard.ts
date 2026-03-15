import type { DayMealPlan, Meal, SnackMeal, WeekMealPlan } from '@/types/meal';

/**
 * 주차 식단(WeekMealPlan) 복사/붙여넣기용 로컬 클립보드.
 *
 * - "복사": 현재 주차 식단을 localStorage에 저장
 * - "붙여넣기": 저장된 식단을 "새 주차 식단"으로 딥카피(새 ID 부여)하여 생성
 *
 * NOTE:
 * - MenuItem.id(음식 ID)는 "음식 자체를 식별"하는 값이므로 그대로 유지합니다.
 * - Week/Day/Meal/Snack의 id는 "편집/렌더링 키"로도 쓰이기 때문에 반드시 새로 생성합니다.
 */

const WEEK_PLAN_CLIPBOARD_KEY = 'food_forge_week_plan_clipboard_v1';

type WeekPlanClipboardPayload = {
  version: 1;
  kind: 'weekPlan';
  copiedAt: string; // ISO timestamp
  plan: WeekMealPlan;
};

function createId(prefix: 'week' | 'day' | 'meal' | 'snack') {
  // 프로젝트 내 생성 규칙( Date.now + random )을 따릅니다.
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function shiftIsoDate(dateIso: string, deltaDays: number) {
  // dateIso 형식은 "YYYY-MM-DD"를 가정합니다.
  const d = new Date(dateIso);
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString().split('T')[0];
}

export function setWeekPlanClipboard(plan: WeekMealPlan) {
  const payload: WeekPlanClipboardPayload = {
    version: 1,
    kind: 'weekPlan',
    copiedAt: new Date().toISOString(),
    plan,
  };

  localStorage.setItem(WEEK_PLAN_CLIPBOARD_KEY, JSON.stringify(payload));
}

export function getWeekPlanClipboard(): WeekMealPlan | null {
  try {
    const raw = localStorage.getItem(WEEK_PLAN_CLIPBOARD_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<WeekPlanClipboardPayload>;
    if (parsed?.version !== 1) return null;
    if (parsed?.kind !== 'weekPlan') return null;
    if (!parsed.plan) return null;

    return parsed.plan as WeekMealPlan;
  } catch {
    return null;
  }
}

export function duplicateWeekMealPlan(plan: WeekMealPlan): WeekMealPlan {
  const newDays: DayMealPlan[] = plan.days.map((day) => {
    const newMeals: Meal[] = day.meals.map((meal) => ({
      ...meal,
      id: createId('meal'),
      rice: { ...meal.rice },
      soup: { ...meal.soup },
      sideDishes: meal.sideDishes.map((d) => ({ ...d })),
      allergens: [...meal.allergens],
    }));

    const newSnacks: SnackMeal[] | undefined = day.snacks
      ? day.snacks.map((snack) => ({
          ...snack,
          id: createId('snack'),
          items: snack.items.map((i) => ({ ...i })),
        }))
      : undefined;

    return {
      ...day,
      id: createId('day'),
      meals: newMeals,
      snacks: newSnacks,
    };
  });

  return {
    ...plan,
    id: createId('week'),
    days: newDays,
  };
}

export function shiftWeekMealPlanDates(plan: WeekMealPlan, deltaDays: number): WeekMealPlan {
  if (deltaDays === 0) return plan;

  return {
    ...plan,
    startDate: shiftIsoDate(plan.startDate, deltaDays),
    endDate: shiftIsoDate(plan.endDate, deltaDays),
    days: plan.days.map((day) => ({
      ...day,
      date: shiftIsoDate(day.date, deltaDays),
    })),
  };
}

/**
 * 붙여넣기용 주차 식단 생성.
 *
 * - 새 ID 부여(독립 편집 가능)
 * - weekNumber를 nextWeekNumber로 변경
 * - desiredStartDate가 주어지면, 원본 startDate와의 차이만큼 날짜를 이동해
 *   현재 편집 중인 주차 흐름에 자연스럽게 이어지게 합니다.
 */
export function createPastedWeekPlan(
  clipboardPlan: WeekMealPlan,
  nextWeekNumber: number,
  desiredStartDate?: string
): WeekMealPlan {
  const duplicated = duplicateWeekMealPlan(clipboardPlan);
  const deltaDays =
    desiredStartDate && clipboardPlan.startDate
      ? Math.round(
          (new Date(desiredStartDate).getTime() - new Date(clipboardPlan.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;
  const shifted = shiftWeekMealPlanDates(duplicated, deltaDays);

  return {
    ...shifted,
    weekNumber: nextWeekNumber,
  };
}















