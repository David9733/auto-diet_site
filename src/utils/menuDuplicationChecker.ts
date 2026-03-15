import { MenuItem, Meal, DayMealPlan, WeekMealPlan } from '@/types/meal';

// 중복 체크에서 제외할 메뉴 이름들
const EXCLUDED_MENU_NAMES = [
  // 밥류
  '흰쌀밥', '현미밥', '잡곡밥',
  // 김치류 (모든 김치 및 장아찌류 - sampleKimchi의 모든 항목)
  '배추김치', '깍두기', '단무지', '총각김치', '오이소박이', '동치미', '파김치', '열무김치',
];

// 메뉴가 중복 체크 대상인지 확인
export function isCheckableMenu(item: MenuItem): boolean {
  // 간식은 제외
  if (item.category === 'side' && item.id.startsWith('sn')) {
    return false;
  }
  // 사용자가 요청한 범위: 밥/국/김치(배추김치·깍두기 포함)는 중복 체크에서 제외
  if (item.category === 'rice') return false;
  if (item.category === 'soup') return false;
  if (item.category === 'kimchi') return false;
  // 면 메뉴에 붙는 미니밥은 보조 요소라 제외
  if (item.id === 'mini-rice' || item.name === '미니밥') return false;
  // 제외 목록에 있는 메뉴 제외
  if (EXCLUDED_MENU_NAMES.includes(item.name)) {
    return false;
  }
  return true;
}

// 식사에서 체크 대상 메뉴 이름 추출
export function getCheckableMenuNames(meal: Meal): Set<string> {
  const names = new Set<string>();
  
  // 밥
  if (isCheckableMenu(meal.rice)) {
    names.add(meal.rice.name);
  }
  
  // 국
  if (isCheckableMenu(meal.soup)) {
    names.add(meal.soup.name);
  }
  
  // 반찬들
  meal.sideDishes.forEach(dish => {
    if (isCheckableMenu(dish)) {
      names.add(dish.name);
    }
  });
  
  return names;
}

// 하루 식단에서 체크 대상 메뉴 이름 추출
export function getDayMenuNames(day: DayMealPlan): Set<string> {
  const names = new Set<string>();
  
  if (day.isNotOperating) return names;
  
  day.meals.forEach(meal => {
    const mealNames = getCheckableMenuNames(meal);
    mealNames.forEach(name => names.add(name));
  });
  
  // 간식은 중복 체크에서 제외
  
  return names;
}

// 주간 식단에서 체크 대상 메뉴 이름 추출
export function getWeekMenuNames(week: WeekMealPlan): Set<string> {
  const names = new Set<string>();
  
  week.days.forEach(day => {
    const dayNames = getDayMenuNames(day);
    dayNames.forEach(name => names.add(name));
  });
  
  return names;
}

// 인접 일자 메뉴와 중복 체크 (1일 전, 1일 후)
export function checkAdjacentDayDuplicates(
  currentDayIndex: number,
  allDays: DayMealPlan[],
  menuName: string
): boolean {
  // 전날 체크
  if (currentDayIndex > 0) {
    const prevDay = allDays[currentDayIndex - 1];
    if (!prevDay.isNotOperating) {
      const prevNames = getDayMenuNames(prevDay);
      if (prevNames.has(menuName)) return true;
    }
  }
  
  // 다음날 체크 (이미 생성된 경우에만)
  if (currentDayIndex < allDays.length - 1) {
    const nextDay = allDays[currentDayIndex + 1];
    if (!nextDay.isNotOperating) {
      const nextNames = getDayMenuNames(nextDay);
      if (nextNames.has(menuName)) return true;
    }
  }
  
  return false;
}

// 같은 주 내 중복 체크
export function checkWeekDuplicates(
  currentDayIndex: number,
  allDays: DayMealPlan[],
  menuName: string
): boolean {
  for (let i = 0; i < allDays.length; i++) {
    if (i === currentDayIndex) continue;
    
    const day = allDays[i];
    if (day.isNotOperating) continue;
    
    const dayNames = getDayMenuNames(day);
    if (dayNames.has(menuName)) return true;
  }
  
  return false;
}

// 인접 주차 메뉴와 중복 체크 (1주 전, 1주 후)
export function checkAdjacentWeekDuplicates(
  menuName: string,
  prevWeekMenus?: Set<string>,
  nextWeekMenus?: Set<string>
): boolean {
  if (prevWeekMenus && prevWeekMenus.has(menuName)) return true;
  if (nextWeekMenus && nextWeekMenus.has(menuName)) return true;
  return false;
}

// 월간(4주) 범위 중복 체크
export function checkMonthDuplicates(menuName: string, monthMenus?: Set<string>): boolean {
  if (!monthMenus) return false;
  return monthMenus.has(menuName);
}

// 메뉴 아이템이 모든 중복 조건을 만족하는지 체크
export function isMenuAllowed(
  item: MenuItem,
  currentDayIndex: number,
  allDays: DayMealPlan[],
  currentDayMenus: Set<string>,
  prevWeekMenus?: Set<string>,
  nextWeekMenus?: Set<string>,
  monthMenus?: Set<string>
): boolean {
  // 제외 대상 메뉴는 항상 허용
  if (!isCheckableMenu(item)) return true;
  
  const menuName = item.name;
  
  // 1. 같은 날 내 중복 체크
  if (currentDayMenus.has(menuName)) return false;
  
  // 2. 인접 일자 중복 체크
  if (checkAdjacentDayDuplicates(currentDayIndex, allDays, menuName)) return false;
  
  // 3. 같은 주 내 중복 체크
  if (checkWeekDuplicates(currentDayIndex, allDays, menuName)) return false;
  
  // 4. 인접 주차 중복 체크
  if (checkAdjacentWeekDuplicates(menuName, prevWeekMenus, nextWeekMenus)) return false;

  // 5. 월간(4주) 중복 체크
  if (checkMonthDuplicates(menuName, monthMenus)) return false;
  
  return true;
}

// 허용된 메뉴 필터링
export function filterAllowedMenus<T extends MenuItem>(
  menus: T[],
  currentDayIndex: number,
  allDays: DayMealPlan[],
  currentDayMenus: Set<string>,
  prevWeekMenus?: Set<string>,
  nextWeekMenus?: Set<string>,
  monthMenus?: Set<string>
): T[] {
  return menus.filter(item => 
    isMenuAllowed(item, currentDayIndex, allDays, currentDayMenus, prevWeekMenus, nextWeekMenus, monthMenus)
  );
}

// 사용된 메뉴 세트 생성 (중복 방지용)
export interface UsedMenuContext {
  currentDayIndex: number;
  allDays: DayMealPlan[];
  currentDayMenus: Set<string>;
  prevWeekMenus?: Set<string>;
  nextWeekMenus?: Set<string>;
  monthMenus?: Set<string>;
}

export function createEmptyUsedMenuContext(): UsedMenuContext {
  return {
    currentDayIndex: 0,
    allDays: [],
    currentDayMenus: new Set<string>(),
  };
}
