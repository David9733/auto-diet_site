import { Meal, StoreSettings } from '@/types/meal';
import { getCostSummary } from '@/utils/costValidator';
import { CircleDollarSign, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';

interface CostDetailsProps {
  meal: Meal;
  settings: StoreSettings;
}

export function CostDetails({ meal, settings }: CostDetailsProps) {
  const summary = getCostSummary(meal, settings);
  const hasWarnings = summary.warnings.length > 0;
  const hasErrors = summary.warnings.some(w => w.severity === 'error');
  const costPercentage = Math.min((summary.breakdown.total / summary.budgetLimit) * 100, 150);

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
            <CircleDollarSign className="w-3.5 h-3.5 text-destructive" />
          ) : hasWarnings ? (
            <CircleDollarSign className="w-3.5 h-3.5 text-warning" />
          ) : (
            <CircleDollarSign className="w-3.5 h-3.5 text-emerald-500" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              원가 분석
            </h4>
            {hasErrors ? (
              <span className="text-xs text-destructive font-medium">예산 초과</span>
            ) : hasWarnings ? (
              <span className="text-xs text-warning font-medium">주의 필요</span>
            ) : (
              <span className="text-xs text-emerald-500 font-medium">적정</span>
            )}
          </div>

          {/* 총 원가 vs 예산 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">총 원가</span>
              <span className={cn(
                'font-bold text-lg',
                hasErrors ? 'text-destructive' : hasWarnings ? 'text-warning' : ''
              )}>
                {summary.breakdown.total.toLocaleString()}원
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={Math.min(costPercentage, 100)} 
                className={cn(
                  'h-2',
                  costPercentage > 100 && '[&>div]:bg-destructive'
                )}
              />
              {/* 예산 한도 표시선 */}
              <div 
                className="absolute top-0 w-0.5 h-2 bg-foreground/50"
                style={{ left: `${Math.min((summary.budgetLimit / (summary.budgetLimit * 1.5)) * 100, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>0원</span>
              <span>예산: {summary.budgetLimit.toLocaleString()}원</span>
            </div>
          </div>

          {/* 원가 비율 */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2">
              {summary.actualRatio > summary.targetRatio ? (
                <TrendingUp className="w-4 h-4 text-destructive" />
              ) : (
                <TrendingDown className="w-4 h-4 text-emerald-500" />
              )}
              <span className="text-sm">원가비율</span>
            </div>
            <div className="text-right">
              <span className={cn(
                'font-bold',
                summary.actualRatio > summary.targetRatio ? 'text-destructive' : 'text-emerald-500'
              )}>
                {summary.actualRatio}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                / 목표 {summary.targetRatio}%
              </span>
            </div>
          </div>

          {/* 비용 상세 내역 */}
          <div className="space-y-2 pt-3 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground">비용 내역</p>
            <div className="space-y-1.5">
              <CostItem label="밥" cost={summary.breakdown.rice} total={summary.breakdown.total} />
              <CostItem label="국" cost={summary.breakdown.soup} total={summary.breakdown.total} />
              <CostItem label="반찬" cost={summary.breakdown.sideDishes} total={summary.breakdown.total} />
            </div>
          </div>

          {/* 1인당 원가 */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5 text-sm">
            <span className="text-muted-foreground">1인당 원가</span>
            <span className="font-medium">{summary.perServing.toLocaleString()}원</span>
          </div>

          {/* 경고 목록 */}
          {summary.warnings.length > 0 && (
            <div className="pt-3 border-t border-border space-y-2">
              <p className="text-xs font-medium text-muted-foreground">주의 사항</p>
              {summary.warnings.map((warning, index) => (
                <div
                  key={index}
                  className={cn(
                    'text-xs px-2 py-1.5 rounded-md flex items-center gap-2',
                    warning.severity === 'error' 
                      ? 'bg-destructive/10 text-destructive' 
                      : 'bg-warning/10 text-warning'
                  )}
                >
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
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

interface CostItemProps {
  label: string;
  cost: number;
  total: number;
}

function CostItem({ label, cost, total }: CostItemProps) {
  const percentage = total > 0 ? Math.round((cost / total) * 100) : 0;
  
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary/60 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="w-16 text-right font-medium">{cost.toLocaleString()}원</span>
      </div>
    </div>
  );
}
