'use client';

import { ChefHat, Plus, History, Clock, ShieldCheck, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onNewPlan: () => void;
  onLoadSaved: () => void;
}

/**
 * Minimal Clean Version
 * - White/gray-50 background
 * - Tight spacing for information density
 * - Subtle borders
 * - No animations or gradients
 * - Focus: Data-intensive screens
 */
export function MinimalWelcomeScreen({ onNewPlan, onLoadSaved }: WelcomeScreenProps) {
  return (
    <div className="relative text-center py-12 bg-gray-50">
      {/* 헤더 섹션 - 컴팩트 */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 border border-primary/20 mb-4">
          <ChefHat className="w-8 h-8 text-primary" />
        </div>
        
        <h2 className="text-2xl font-bold mb-2 font-noto text-gray-900">
          AI 기반 식단 자동 생성
        </h2>
        <p className="text-sm text-gray-600 max-w-md mx-auto mb-6 font-noto leading-relaxed">
          영양사가 설계한 규칙을 기반으로, 클릭 몇 번으로 1주~1달 식단이 자동 생성됩니다.
        </p>
        
        {/* 핵심 기능 - 컴팩트 레이아웃 */}
        <div className="grid grid-cols-3 gap-3 mb-6 max-w-2xl mx-auto">
          <div className="flex flex-col items-center gap-1 p-3 bg-white border border-gray-200 rounded-lg">
            <Clock className="w-4 h-4 text-primary mb-1" />
            <span className="text-xs font-medium text-gray-900 font-inter">80% 단축</span>
            <span className="text-xs text-gray-500 font-noto">작업 시간</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-3 bg-white border border-gray-200 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-primary mb-1" />
            <span className="text-xs font-medium text-gray-900 font-inter">100% 검증</span>
            <span className="text-xs text-gray-500 font-noto">영양·알레르기</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-3 bg-white border border-gray-200 rounded-lg">
            <TrendingDown className="w-4 h-4 text-primary mb-1" />
            <span className="text-xs font-medium text-gray-900 font-inter">실시간</span>
            <span className="text-xs text-gray-500 font-noto">원가 최적화</span>
          </div>
        </div>

        {/* 액션 버튼 - 컴팩트 */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Button
            size="default"
            className="gap-2 h-11 px-6 font-inter"
            onClick={onNewPlan}
          >
            <Plus className="w-4 h-4" />
            새로 작성
          </Button>
          <Button
            variant="outline"
            size="default"
            className="gap-2 h-11 px-6 font-inter border-gray-300"
            onClick={onLoadSaved}
          >
            <History className="w-4 h-4" />
            불러오기
          </Button>
        </div>

        {/* 통계 카드 - 심플 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl mx-auto">
          <h3 className="text-base font-semibold mb-4 font-noto text-gray-900">핵심 지표</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1 font-inter">80%</div>
              <div className="text-xs text-gray-600 font-noto">시간 단축</div>
            </div>
            <div className="text-center border-l border-r border-gray-200">
              <div className="text-3xl font-bold text-primary mb-1 font-inter">100%</div>
              <div className="text-xs text-gray-600 font-noto">규칙 준수</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1 font-inter">실시간</div>
              <div className="text-xs text-gray-600 font-noto">최적화</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
















