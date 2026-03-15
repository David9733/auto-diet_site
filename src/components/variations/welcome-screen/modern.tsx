'use client';

import { ChefHat, Plus, History, Clock, ShieldCheck, TrendingDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onNewPlan: () => void;
  onLoadSaved: () => void;
}

/**
 * Modern Gradient Version
 * - Gradient backgrounds (hero, card)
 * - Colorful icons
 * - Soft shadows
 * - Hover animations
 * - Focus: Brand identity, visual appeal
 */
export function ModernWelcomeScreen({ onNewPlan, onLoadSaved }: WelcomeScreenProps) {
  return (
    <div className="relative text-center py-20 gradient-hero">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>
      
      {/* 컨텐츠 */}
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* 아이콘 - 그라데이션 */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl gradient-primary shadow-soft mb-8 transition-all hover:scale-110 hover:shadow-hover duration-300">
          <ChefHat className="w-12 h-12 text-white" />
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
          <h2 className="text-4xl font-bold font-noto bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            AI 기반 식단 자동 생성
          </h2>
          <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
        </div>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 font-noto leading-relaxed">
          영양사가 설계한 규칙을 기반으로, 클릭 몇 번으로 <br />
          1주~1달 식단이 자동 생성됩니다.
        </p>
        
        {/* 핵심 기능 - 컬러풀 카드 */}
        <div className="flex items-center justify-center gap-6 mb-12">
          <div className="group flex items-center gap-3 px-6 py-4 gradient-card rounded-2xl shadow-card border border-border/50 hover:shadow-hover transition-all duration-300 hover:scale-105">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold font-inter">80% 단축</div>
              <div className="text-xs text-muted-foreground font-noto">작업 시간</div>
            </div>
          </div>
          <div className="group flex items-center gap-3 px-6 py-4 gradient-card rounded-2xl shadow-card border border-border/50 hover:shadow-hover transition-all duration-300 hover:scale-105">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold font-inter">자동 검증</div>
              <div className="text-xs text-muted-foreground font-noto">영양·알레르기</div>
            </div>
          </div>
          <div className="group flex items-center gap-3 px-6 py-4 gradient-card rounded-2xl shadow-card border border-border/50 hover:shadow-hover transition-all duration-300 hover:scale-105">
            <div className="p-2 rounded-lg bg-green-500/20">
              <TrendingDown className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold font-inter">실시간</div>
              <div className="text-xs text-muted-foreground font-noto">원가 최적화</div>
            </div>
          </div>
        </div>

        {/* 액션 버튼 - 그라데이션 */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <Button
            size="lg"
            className="gap-2 h-16 px-10 gradient-primary shadow-soft hover:shadow-hover transition-all duration-300 hover:scale-105 font-inter text-base"
            onClick={onNewPlan}
          >
            <Plus className="w-6 h-6" />
            새로 식단 작성하기
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 h-16 px-10 shadow-card hover:shadow-hover transition-all duration-300 hover:scale-105 font-inter text-base"
            onClick={onLoadSaved}
          >
            <History className="w-6 h-6" />
            저장된 식단 불러오기
          </Button>
        </div>

        {/* 통계 카드 - 컬러풀 그라데이션 */}
        <div className="gradient-card rounded-3xl border border-border/50 p-10 max-w-4xl mx-auto shadow-soft">
          <h3 className="text-2xl font-bold mb-8 font-noto">핵심 성과</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="group text-center p-8 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl border border-orange-500/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3 font-inter">80%</div>
              <div className="text-sm text-muted-foreground font-noto">작업 시간 단축</div>
            </div>
            <div className="group text-center p-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-500/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3 font-inter">100%</div>
              <div className="text-sm text-muted-foreground font-noto">영양 규칙 준수</div>
            </div>
            <div className="group text-center p-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3 font-inter">실시간</div>
              <div className="text-sm text-muted-foreground font-noto">원가 최적화</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
















