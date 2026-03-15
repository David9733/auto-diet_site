import { Meal } from '@/types/meal';
import { getNutritionSummary, NutritionWarning } from '@/utils/nutritionValidator';
import { AlertTriangle, CheckCircle, Flame, Droplets, Beef, Wheat, Droplet } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';

interface NutritionDetailsProps {
  meal: Meal;
}

export function NutritionDetails({ meal }: NutritionDetailsProps) {
  const summary = getNutritionSummary(meal);
  const hasWarnings = summary.validation.warnings.length > 0;
  const hasErrors = summary.validation.warnings.some(w => w.severity === 'error');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'p-1.5 rounded-full transition-colors',
            hasErrors ? 'bg-destructive/10 hover:bg-destructive/20' :
            hasWarnings ? 'bg-warning/10 hover:bg-warning/20' :
            'bg-emerald-500/10 hover:bg-emerald-500/20'
          )}
        >
          {hasErrors ? (
            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
          ) : hasWarnings ? (
            <AlertTriangle className="w-3.5 h-3.5 text-warning" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">영양 정보</h4>
            {hasErrors ? (
              <span className="text-xs text-destructive font-medium">기준 초과</span>
            ) : hasWarnings ? (
              <span className="text-xs text-warning font-medium">주의 필요</span>
            ) : (
              <span className="text-xs text-emerald-500 font-medium">양호</span>
            )}
          </div>

          {/* 영양소 상세 */}
          <div className="space-y-3">
            {/* 칼로리 */}
            <NutritionBar
              icon={<Flame className="w-3.5 h-3.5" />}
              label="칼로리"
              value={summary.calories}
              max={900}
              unit="kcal"
              warning={summary.validation.warnings.find(w => w.type === 'calories')}
            />

            {/* 나트륨 */}
            <NutritionBar
              icon={<Droplets className="w-3.5 h-3.5" />}
              label="나트륨"
              value={summary.sodium}
              max={1500}
              unit="mg"
              warning={summary.validation.warnings.find(w => w.type === 'sodium')}
            />

            {/* 단백질 */}
            <NutritionBar
              icon={<Beef className="w-3.5 h-3.5" />}
              label="단백질"
              value={summary.protein}
              max={50}
              unit="g"
              warning={summary.validation.warnings.find(w => w.type === 'protein')}
            />
          </div>

          {/* 탄단지 비율 */}
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">탄단지 비율</p>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex-1 text-center">
                <div className={cn(
                  'font-semibold',
                  (summary.ratios.carbsRatio < 45 || summary.ratios.carbsRatio > 65) && 'text-warning'
                )}>
                  {summary.ratios.carbsRatio}%
                </div>
                <div className="text-muted-foreground">탄수화물</div>
              </div>
              <div className="flex-1 text-center">
                <div className="font-semibold">{summary.ratios.proteinRatio}%</div>
                <div className="text-muted-foreground">단백질</div>
              </div>
              <div className="flex-1 text-center">
                <div className={cn(
                  'font-semibold',
                  summary.ratios.fatRatio > 35 && 'text-warning'
                )}>
                  {summary.ratios.fatRatio}%
                </div>
                <div className="text-muted-foreground">지방</div>
              </div>
            </div>
          </div>

          {/* 경고 목록 */}
          {summary.validation.warnings.length > 0 && (
            <div className="pt-3 border-t border-border space-y-2">
              <p className="text-xs font-medium text-muted-foreground">주의 사항</p>
              {summary.validation.warnings.map((warning, index) => (
                <div
                  key={index}
                  className={cn(
                    'text-xs px-2 py-1.5 rounded-md',
                    warning.severity === 'error' 
                      ? 'bg-destructive/10 text-destructive' 
                      : 'bg-warning/10 text-warning'
                  )}
                >
                  {warning.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface NutritionBarProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  max: number;
  unit: string;
  warning?: NutritionWarning;
}

function NutritionBar({ icon, label, value, max, unit, warning }: NutritionBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const isOver = value > max;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <span className={cn(
          'font-medium',
          warning?.severity === 'error' ? 'text-destructive' :
          warning?.severity === 'warning' ? 'text-warning' : ''
        )}>
          {value.toLocaleString()}{unit}
        </span>
      </div>
      <div className="relative">
        <Progress 
          value={percentage} 
          className={cn(
            'h-1.5',
            isOver && '[&>div]:bg-destructive'
          )}
        />
        {/* 기준선 표시 */}
        <div 
          className="absolute top-0 w-0.5 h-1.5 bg-foreground/30"
          style={{ left: '100%', transform: 'translateX(-100%)' }}
        />
      </div>
    </div>
  );
}
