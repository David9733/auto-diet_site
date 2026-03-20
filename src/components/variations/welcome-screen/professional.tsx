'use client';

import { ChefHat, Plus, History, Clock, ShieldCheck, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onNewPlan: () => void;
  onLoadSaved: () => void;
}

/**
 * Professional Dark Version
 * - Dark mode background (gray-900/800)
 * - Elevated shadows
 * - Larger font sizes
 * - Accent colors for emphasis
 * - Focus: Long-term usage, reduced eye strain
 */
export function ProfessionalWelcomeScreen({ onNewPlan, onLoadSaved }: WelcomeScreenProps) {
  return (
    <div className="relative text-center py-16 bg-gray-900 text-white">
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 opacity-50" />
      
      {/* 컨텐츠 */}
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 shadow-2xl mb-8">
          <ChefHat className="w-12 h-12 text-white" />
        </div>
        
        <h2 className="text-4xl font-bold mb-4 font-noto text-white">
          스마트 식단 자동생성
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10 font-noto leading-relaxed">
          영양사가 설계한 규칙을 기반으로, 클릭 몇 번으로 <br />
          1주~1달 식단이 자동 생성됩니다.
        </p>
        
        {/* 핵심 기능 - 다크 모드 스타일 */}
        <div className="flex items-center justify-center gap-8 mb-12">
          <div className="flex items-center gap-3 px-6 py-3 bg-gray-800/80 border border-gray-700 rounded-xl backdrop-blur-sm">
            <Clock className="w-5 h-5 text-green-400" />
            <div className="text-left">
              <div className="text-sm font-semibold text-white font-inter">80% 단축</div>
              <div className="text-xs text-gray-400 font-noto">작업 시간</div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-gray-800/80 border border-gray-700 rounded-xl backdrop-blur-sm">
            <ShieldCheck className="w-5 h-5 text-green-400" />
            <div className="text-left">
              <div className="text-sm font-semibold text-white font-inter">자동 검증</div>
              <div className="text-xs text-gray-400 font-noto">영양·알레르기</div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-gray-800/80 border border-gray-700 rounded-xl backdrop-blur-sm">
            <TrendingDown className="w-5 h-5 text-green-400" />
            <div className="text-left">
              <div className="text-sm font-semibold text-white font-inter">실시간</div>
              <div className="text-xs text-gray-400 font-noto">원가 최적화</div>
            </div>
          </div>
        </div>

        {/* 액션 버튼 - 큰 사이즈 */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <Button
            size="lg"
            className="gap-2 h-16 px-10 bg-green-600 hover:bg-green-500 text-white shadow-2xl font-inter text-base"
            onClick={onNewPlan}
          >
            <Plus className="w-6 h-6" />
            새로 식단 작성하기
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 h-16 px-10 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white shadow-xl font-inter text-base"
            onClick={onLoadSaved}
          >
            <History className="w-6 h-6" />
            저장된 식단 불러오기
          </Button>
        </div>

        {/* 통계 카드 - 다크 모드 */}
        <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl border border-gray-700 p-8 max-w-3xl mx-auto shadow-2xl">
          <h3 className="text-xl font-semibold mb-6 font-noto text-white">핵심 성과</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-6 bg-green-900/30 rounded-xl border border-green-700/50">
              <div className="text-5xl font-bold text-green-400 mb-2 font-inter">80%</div>
              <div className="text-sm text-gray-300 font-noto">작업 시간 단축</div>
            </div>
            <div className="text-center p-6 bg-green-900/30 rounded-xl border border-green-700/50">
              <div className="text-5xl font-bold text-green-400 mb-2 font-inter">100%</div>
              <div className="text-sm text-gray-300 font-noto">영양 규칙 준수</div>
            </div>
            <div className="text-center p-6 bg-green-900/30 rounded-xl border border-green-700/50">
              <div className="text-5xl font-bold text-green-400 mb-2 font-inter">실시간</div>
              <div className="text-sm text-gray-300 font-noto">원가 최적화</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
















