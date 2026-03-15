import { useState } from 'react';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Sparkles,
  ThumbsUp,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAIMealGeneration } from '@/hooks/useAIMealGeneration';
import { WeekMealPlan, StoreSettings } from '@/types/meal';

interface AIAnalysisDialogProps {
  weekPlans: WeekMealPlan[];
  settings: StoreSettings;
}

export function AIAnalysisDialog({ weekPlans, settings }: AIAnalysisDialogProps) {
  const [open, setOpen] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { analyzeNutrition, isAnalyzing } = useAIMealGeneration();

  const handleAnalyze = async () => {
    if (weekPlans.length === 0) return;
    
    const result = await analyzeNutrition(weekPlans[0], settings);
    if (result) {
      setAnalysis(result);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '적정':
      case '좋음':
        return 'text-green-600 bg-green-100';
      case '보통':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-red-600 bg-red-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Brain className="w-4 h-4" />
          AI 영양 분석
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI 영양 분석 리포트
          </DialogTitle>
        </DialogHeader>

        {!analysis ? (
          <div className="py-8 text-center">
            <Brain className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">
              AI가 현재 식단을 분석하고 개선점을 제안합니다.
            </p>
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || weekPlans.length === 0}
              className="gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  식단 분석 시작
                </>
              )}
            </Button>
            {weekPlans.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                먼저 식단을 생성해주세요.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* 종합 점수 */}
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border">
              <div className={`text-5xl font-bold mb-2 ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}
                <span className="text-2xl text-muted-foreground">/100</span>
              </div>
              <p className="text-muted-foreground">{analysis.summary}</p>
            </div>

            {/* 영양 분석 */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                영양 분석
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(analysis.nutritionAnalysis).map(([key, value]: [string, any]) => (
                  <div key={key} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium capitalize">
                        {key === 'calories' ? '칼로리' : 
                         key === 'protein' ? '단백질' : 
                         key === 'sodium' ? '나트륨' : '다양성'}
                      </span>
                      <Badge className={getStatusColor(value.status)} variant="secondary">
                        {value.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{value.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 개선 제안 */}
            {analysis.improvements.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  개선 제안
                </h4>
                <div className="space-y-2">
                  {analysis.improvements.map((item: any, index: number) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border ${getPriorityColor(item.priority)}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4" />
                        <Badge variant="outline" className="text-xs">
                          {item.priority === 'high' ? '중요' : item.priority === 'medium' ? '권장' : '참고'}
                        </Badge>
                        <span className="text-xs">{item.category}</span>
                      </div>
                      <p className="text-sm">{item.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 잘된 점 */}
            {analysis.positives.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4" />
                  잘된 점
                </h4>
                <div className="space-y-2">
                  {analysis.positives.map((item: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-green-50 text-green-700">
                      <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 다시 분석 버튼 */}
            <div className="pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
                className="w-full gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    다시 분석하기
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
