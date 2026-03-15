'use client';

import { ChefHat, Plus, History, Clock, ShieldCheck, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GridMotion from '@/components/ui/GridMotion';
import ScrollReveal from '@/components/ui/ScrollReveal';

interface WelcomeScreenProps {
  onNewPlan: () => void;
  onLoadSaved: () => void;
}

/**
 * Source Version (Original Design)
 * - Current production design
 * - GridMotion background with animation
 * - Scroll reveal sections
 */
export function SourceWelcomeScreen({ onNewPlan, onLoadSaved }: WelcomeScreenProps) {
  const gridItems = [
    'Health', 'Nutrition', 'Fresh', 'Menu', 'Meal', 'Chef', 'Diet',
    'Auto', 'Plan', 'Food', 'Smart', 'Cook', 'AI', 'Recipe',
    'Menu', 'Meal', 'Chef', 'Diet', 'Auto', 'Plan', 'Food',
    'Health', 'Nutrition', 'Fresh', 'Smart', 'Cook', 'Recipe', 'AI',
  ];

  return (
    <div className="relative text-center py-16 animate-fade-in">
      {/* GridMotion 배경 */}
      <div className="absolute top-0 left-0 right-0 h-[600px] opacity-15 pointer-events-none overflow-hidden rounded-2xl">
        <GridMotion items={gridItems} gradientColor="oklch(0.5795 0.1422 143.4678)" />
      </div>
      
      {/* 컨텐츠 */}
      <div className="relative z-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary shadow-soft mb-6">
          <ChefHat className="w-10 h-10 text-primary-foreground" />
        </div>
        <h2 className="text-3xl font-bold mb-3 font-noto">
          AI 기반 식단 자동 생성
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-8 font-noto">
          영양사가 설계한 규칙을 기반으로, 클릭 몇 번으로 <br />
          1주~1달 식단이 자동 생성됩니다.
        </p>
        
        <div className="flex items-center justify-center gap-8 mb-12">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-noto">
            <Clock className="w-4 h-4 text-primary" />
            <span>작업 시간 80% 단축</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-noto">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>영양·알레르기 자동 검증</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-noto">
            <TrendingDown className="w-4 h-4 text-primary" />
            <span>원가 자동 최적화</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mb-24">
          <Button
            size="lg"
            className="gap-2 h-14 px-8 font-inter"
            onClick={onNewPlan}
          >
            <Plus className="w-5 h-5" />
            새로 식단 작성하기
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 h-14 px-8 font-inter"
            onClick={onLoadSaved}
          >
            <History className="w-5 h-5" />
            저장된 식단 불러오기
          </Button>
        </div>

        {/* Feature Sections - 간략화 버전 */}
        <div className="w-full mx-auto space-y-16 py-16 px-6">
          <div className="relative bg-card/80 backdrop-blur-sm rounded-3xl p-12 border border-border/50 shadow-xl">
            <h3 className="text-2xl font-bold mb-6 font-noto">핵심 가치</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-primary/10 rounded-2xl border border-primary/20">
                <div className="text-4xl font-bold text-primary mb-2 font-inter">80%</div>
                <div className="text-sm text-muted-foreground font-noto">작업 시간 단축</div>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-2xl border border-primary/20">
                <div className="text-4xl font-bold text-primary mb-2 font-inter">100%</div>
                <div className="text-sm text-muted-foreground font-noto">영양 규칙 준수</div>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-2xl border border-primary/20">
                <div className="text-4xl font-bold text-primary mb-2 font-inter">실시간</div>
                <div className="text-sm text-muted-foreground font-noto">원가 최적화</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
















