import { Settings, Users, Calendar, Utensils, CircleDollarSign, Cookie, CalendarDays, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { StoreSettings } from '@/types/meal';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { COMMON_ALLERGENS } from '@/utils/allergenValidator';

interface SettingsPanelProps {
  settings: StoreSettings;
  onSettingsChange: (settings: StoreSettings) => void;
  onGenerate: (weeks: number) => void;
  isGenerating: boolean;
}

export function SettingsPanel({
  settings,
  onSettingsChange,
  onGenerate,
  isGenerating,
}: SettingsPanelProps) {
  // 식단 생성(1/2/4주) 버튼의 선택 상태를 하나로 관리합니다.
  // 기존에는 `weeks === 1` 조건으로 고정되어 1주만 항상 선택(초록색)으로 보였음.
  const [selectedGenerateWeeks, setSelectedGenerateWeeks] = useState<1 | 2 | 4>(1);

  const updateSetting = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  // 여러 설정을 한 번에 업데이트해야(자동 토글/숫자 선택 등) 상태가 꼬이지 않습니다.
  const updateSettings = (partial: Partial<StoreSettings>) => {
    onSettingsChange({ ...settings, ...partial });
  };

  const selectedDate = settings.startDate ? new Date(settings.startDate) : undefined;

  const allergenOptions = COMMON_ALLERGENS;

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden animate-fade-in">
      <div className="p-5 border-b border-border/50 bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">식단 설정</h3>
            <p className="text-sm text-muted-foreground">매장 기준에 맞게 설정하세요</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* 상단 3열: 시작 날짜 / 주간 운영 일수 / 하루 끼니 수
            - 시작 날짜(고정폭) / 운영일수(가변) / 끼니수(조금 더 넓게) */}
        <div className="grid grid-cols-1 md:grid-cols-[276px_1.15fr_0.95fr] gap-6">
          {/* 시작 날짜 (왼쪽) */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              시작 날짜
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  // 높이를 2.5rem(h-10)로 고정해서 달력 팝오버와 균형을 맞춥니다.
                  className={cn(
                    // 달력 폭(7칸 * w-9 + 좌우 padding p-3) ≈ 276px에 맞춰 버튼도 동일 폭으로 고정
                    'w-[276px] max-w-full h-10 justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP', { locale: ko }) : '날짜를 선택하세요'}
                </Button>
              </PopoverTrigger>
              {/* 버튼과 달력(팝오버) 가로폭을 동일하게 맞춤 */}
              <PopoverContent className="w-[276px] max-w-full p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => updateSetting('startDate', date ? format(date, 'yyyy-MM-dd') : undefined)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* 운영 일수 (가운데) */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              주간 운영 일수
            </Label>
            <div className="grid grid-cols-7 gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                <button
                  key={days}
                  onClick={() => updateSetting('daysPerWeek', days as 1 | 2 | 3 | 4 | 5 | 6 | 7)}
                  className={cn(
                    'py-2 px-2 rounded-lg text-sm font-medium transition-smooth',
                    settings.daysPerWeek === days ? 'bg-primary text-primary-foreground shadow-soft' : 'bg-secondary hover:bg-secondary/80'
                  )}
                >
                  {days}일
                </button>
              ))}
            </div>

            {/* 반찬 수 (주간 운영 일수 아래) */}
            <div className="pt-2 space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Utensils className="w-4 h-4 text-muted-foreground" />
                반찬 수
              </Label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    // 자동은 토글(켜기/끄기)로 동작해야 다시 3~8 수동 선택이 가능합니다.
                    if (settings.sideDishCountAuto) {
                      updateSettings({
                        sideDishCountAuto: false,
                        // 자동을 끄는 순간 sideDishCount가 0/비어있으면 기본값(4)으로 복구
                        sideDishCount: settings.sideDishCount && settings.sideDishCount > 0 ? settings.sideDishCount : 4,
                      });
                      return;
                    }

                    // 자동을 켜면 수동 선택값 표시는 해제(요청), 계산은 예산/원가비율 기반으로 진행
                    updateSettings({ sideDishCountAuto: true, sideDishCount: 0 });
                  }}
                  className={cn(
                    'w-full py-2.5 px-2 rounded-lg text-sm font-medium transition-smooth touch-manipulation select-none',
                    settings.sideDishCountAuto ? 'bg-primary text-primary-foreground shadow-soft' : 'bg-secondary hover:bg-secondary/80'
                  )}
                >
                  자동
                </button>
                {[2, 3, 4, 5, 6, 7, 8].map((count) => (
                  <button
                    key={count}
                    type="button"
                    // 자동이 켜져 있어도 숫자를 누르면 바로 자동이 꺼지고 해당 값으로 전환되게(원클릭 전환)
                    onClick={() => updateSettings({ sideDishCountAuto: false, sideDishCount: count })}
                    className={cn(
                      'w-full py-2.5 px-2 rounded-lg text-sm font-medium transition-smooth touch-manipulation select-none',
                      // 자동일 땐 선택 표시를 해제(요청). 단, 클릭하면 즉시 자동이 꺼지고 선택 표시가 들어감.
                      !settings.sideDishCountAuto && settings.sideDishCount === count
                        ? 'bg-primary text-primary-foreground shadow-soft'
                        : 'bg-secondary hover:bg-secondary/80',
                    )}
                  >
                    {count}개
                  </button>
                ))}
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                밥/국을 제외한 반찬 개수입니다 (최소 2개)
                <span className="hidden sm:inline"> · </span>
                <span className="sm:hidden"><br /></span>
                자동을 켜면 예산/원가비율 기준으로 조절됩니다.
              </p>
            </div>
          </div>

          {/* 하루 끼니 수 (오른쪽) + 조건부 옵션 */}
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Utensils className="w-4 h-4 text-muted-foreground" />
                하루 끼니 수
              </Label>
              {/* 1/2/3끼 버튼 */}
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((meals) => (
                  <button
                    key={meals}
                    onClick={() => updateSetting('mealsPerDay', meals as 1 | 2 | 3)}
                    className={cn(
                      'w-full py-3 px-4 rounded-xl text-sm font-medium transition-smooth',
                      settings.mealsPerDay === meals ? 'bg-primary text-primary-foreground shadow-soft' : 'bg-secondary hover:bg-secondary/80'
                    )}
                  >
                    {meals}끼
                  </button>
                ))}
              </div>
            </div>

            {/* 1끼 끼니 선택 (오른쪽 컬럼 하단) */}
            {settings.mealsPerDay === 1 && (
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Utensils className="w-4 h-4 text-muted-foreground" />
                  끼니 선택
                </Label>
                <div className="flex gap-2">
                  {[
                    { value: 'breakfast', label: '아침' },
                    { value: 'lunch', label: '점심' },
                    { value: 'dinner', label: '저녁' },
                  ].map((meal) => (
                    <button
                      key={meal.value}
                      onClick={() => updateSetting('singleMealType', meal.value as 'breakfast' | 'lunch' | 'dinner')}
                      className={cn(
                        'flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-smooth',
                        settings.singleMealType === meal.value ? 'bg-primary text-primary-foreground shadow-soft' : 'bg-secondary hover:bg-secondary/80'
                      )}
                    >
                      {meal.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 끼니 조합 (2끼일 때만, 오른쪽 컬럼 하단) */}
            {settings.mealsPerDay === 2 && (
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Utensils className="w-4 h-4 text-muted-foreground" />
                  끼니 조합
                </Label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateSetting('mealCombination', 'breakfast_lunch')}
                    className={cn(
                      'flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-smooth',
                      settings.mealCombination === 'breakfast_lunch' ? 'bg-primary text-primary-foreground shadow-soft' : 'bg-secondary hover:bg-secondary/80'
                    )}
                  >
                    아침 + 점심
                  </button>
                  <button
                    onClick={() => updateSetting('mealCombination', 'lunch_dinner')}
                    className={cn(
                      'flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-smooth',
                      settings.mealCombination === 'lunch_dinner' ? 'bg-primary text-primary-foreground shadow-soft' : 'bg-secondary hover:bg-secondary/80'
                    )}
                  >
                    점심 + 저녁
                  </button>
                  <button
                    onClick={() => updateSetting('mealCombination', 'breakfast_dinner')}
                    className={cn(
                      'flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-smooth',
                      settings.mealCombination === 'breakfast_dinner' ? 'bg-primary text-primary-foreground shadow-soft' : 'bg-secondary hover:bg-secondary/80'
                    )}
                  >
                    아침 + 저녁
                  </button>
                </div>
              </div>
            )}

            {/* 간식 버튼 (끼니 선택/조합 아래에 항상 노출) */}
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <label className="flex items-center justify-center gap-2 px-2 py-2 rounded-xl bg-secondary/50 cursor-pointer hover:bg-secondary transition-smooth">
                  <input
                    type="checkbox"
                    checked={settings.snackMorning}
                    onChange={(e) => updateSetting('snackMorning', e.target.checked)}
                    className="w-4 h-4 rounded border-border accent-primary"
                  />
                  <span className="text-xs whitespace-nowrap">오전 간식</span>
                </label>
                <label className="flex items-center justify-center gap-2 px-2 py-2 rounded-xl bg-secondary/50 cursor-pointer hover:bg-secondary transition-smooth">
                  <input
                    type="checkbox"
                    checked={settings.snackAfternoon}
                    onChange={(e) => updateSetting('snackAfternoon', e.target.checked)}
                    className="w-4 h-4 rounded border-border accent-primary"
                  />
                  <span className="text-xs whitespace-nowrap">오후 간식</span>
                </label>
                <label className="flex items-center justify-center gap-2 px-2 py-2 rounded-xl bg-secondary/50 cursor-pointer hover:bg-secondary transition-smooth">
                  <input
                    type="checkbox"
                    checked={settings.snackEvening}
                    onChange={(e) => updateSetting('snackEvening', e.target.checked)}
                    className="w-4 h-4 rounded border-border accent-primary"
                  />
                  <span className="text-xs whitespace-nowrap">야식</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 알레르기 주의 설정 */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <ShieldAlert className="w-4 h-4 text-muted-foreground" />
            알레르기 주의 설정
          </Label>
          <p className="text-xs text-muted-foreground">
            선택한 알레르기가 포함된 메뉴에 경고가 표시됩니다
          </p>
          {/* 알레르기 선택 영역: 테두리(경계선) 추가 */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-2 p-2 rounded-xl border border-border/60 bg-secondary/10">
            {allergenOptions.map((allergen) => {
              const isSelected = settings.watchAllergens?.includes(allergen.name) || false;
              return (
                <button
                  key={allergen.id}
                  onClick={() => {
                    const current = settings.watchAllergens || [];
                    const updated = isSelected
                      ? current.filter(a => a !== allergen.name)
                      : [...current, allergen.name];
                    updateSetting('watchAllergens', updated);
                  }}
                  className={cn(
                    // 11개/줄 레이아웃에서 촘촘하게 보이도록 패딩을 살짝 줄입니다.
                    'flex flex-col items-center gap-1 p-1.5 rounded-lg text-[11px] leading-tight transition-smooth',
                    isSelected
                      ? 'bg-red-500/20 text-red-600 border border-red-500/30'
                      : 'bg-secondary/50 hover:bg-secondary'
                  )}
                >
                  {/* 알레르기 이모지는 사용자 식별에 도움이 되므로 표시합니다. */}
                  <span className="text-base leading-none">{allergen.icon}</span>
                  <span className="truncate w-full text-center">{allergen.name}</span>
                </button>
              );
            })}
          </div>
          {(settings.watchAllergens?.length || 0) > 0 && (
            <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">
              <ShieldAlert className="w-4 h-4" />
              <span>{settings.watchAllergens?.length}개 알레르기 주의 중</span>
            </div>
          )}
        </div>

        {/* 하단 3열: 인원 수 / 1인 식비 예산 / 식재료 원가 비율(더 넓게)
            - 인원 수/예산은 더 줄이고, 원가 비율 영역은 더 넓게 */}
        <div className="grid grid-cols-1 md:grid-cols-[0.85fr_0.85fr_2.3fr] gap-6">
          {/* 인원 수 (왼쪽) */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Users className="w-4 h-4 text-muted-foreground" />
              인원 수
            </Label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateSetting('servingCount', Math.max(1, settings.servingCount - 10))}
                className="w-10 h-10 rounded-lg bg-secondary hover:bg-secondary/80 transition-smooth font-medium"
              >
                -
              </button>
              <div className="flex-1 flex items-center justify-center gap-1">
                <Input
                  type="number"
                  value={settings.servingCount}
                  onChange={(e) => updateSetting('servingCount', Math.max(1, Number(e.target.value)))}
                  className="w-24 h-10 text-center text-xl font-bold"
                  min={1}
                />
                <span className="text-sm text-muted-foreground">명</span>
              </div>
              <button
                onClick={() => updateSetting('servingCount', settings.servingCount + 10)}
                className="w-10 h-10 rounded-lg bg-secondary hover:bg-secondary/80 transition-smooth font-medium"
              >
                +
              </button>
            </div>
          </div>

          {/* 1인 식비 예산 (가운데) */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <CircleDollarSign className="w-4 h-4 text-muted-foreground" />
              1인 식비 예산
            </Label>
            <div className="relative">
              <input
                type="number"
                value={settings.budgetPerMeal}
                onChange={(e) => updateSetting('budgetPerMeal', Number(e.target.value))}
                className="w-full h-12 px-4 pr-12 rounded-xl bg-secondary border-0 text-center font-medium focus:ring-2 focus:ring-primary outline-none"
                step={100}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">원</span>
            </div>
          </div>

          {/* 식재료 원가 비율 (오른쪽, 더 넓게: 2칸) */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              식재료 원가 비율: <span className="text-primary">{settings.costRatio}%</span>
            </Label>
            <input
              type="range"
              min={1}
              max={100}
              value={settings.costRatio}
              onChange={(e) => updateSetting('costRatio', Number(e.target.value))}
              className="w-full h-3 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 생성 버튼들 */}
      <div className="p-5 border-t border-border/50 bg-secondary/20 space-y-3">
        <p className="text-sm font-medium text-center text-muted-foreground mb-4">식단 자동 생성</p>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 4].map((weeks) => (
            <Button
              key={weeks}
              onClick={() => {
                setSelectedGenerateWeeks(weeks as 1 | 2 | 4);
                onGenerate(weeks);
              }}
              disabled={isGenerating}
              variant={weeks === selectedGenerateWeeks ? 'default' : 'secondary'}
              className="h-12"
            >
              {isGenerating ? (
                <span className="animate-pulse-soft">생성중...</span>
              ) : (
                `${weeks}주`
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
