'use client';

import { ChefHat, Plus, History, Clock, ShieldCheck, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GridMotion from '@/components/ui/GridMotion';
import ScrollReveal from '@/components/ui/ScrollReveal';

interface WelcomeScreenProps {
  onNewPlan: () => void;
  onLoadSaved: () => void;
}

export function WelcomeScreen({ onNewPlan, onLoadSaved }: WelcomeScreenProps) {
  // GridMotion 배경 아이템 (식단 관련 텍스트)
  const gridItems = [
    'Health', 'Nutrition', 'Fresh', 'Menu', 'Meal', 'Chef', 'Diet',
    'Auto', 'Plan', 'Food', 'Smart', 'Cook', 'AI', 'Recipe',
    'Menu', 'Meal', 'Chef', 'Diet', 'Auto', 'Plan', 'Food',
    'Health', 'Nutrition', 'Fresh', 'Smart', 'Cook', 'Recipe', 'AI',
  ];

  return (
    <div className="relative text-center pt-10 sm:pt-16 pb-0 animate-fade-in">
      {/* GridMotion 배경 */}
      <div className="absolute top-0 left-0 right-0 h-[420px] sm:h-[600px] opacity-15 pointer-events-none overflow-hidden rounded-2xl">
        <GridMotion items={gridItems} gradientColor="oklch(0.5795 0.1422 143.4678)" />
      </div>
      
      {/* 컨텐츠 */}
      <div className="relative z-10">
      <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl gradient-primary shadow-soft mb-4 sm:mb-6">
        <ChefHat className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 px-4 sm:px-0">
        스마트 식단 자동생성
      </h2>
      <p className="text-muted-foreground max-w-lg mx-auto mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed px-4 sm:px-0">
        영양사가 설계한 규칙을 기반으로, 클릭 몇 번으로
        <span className="hidden sm:inline"><br /></span>
        1주~1달 식단이 자동 생성됩니다.
      </p>
      
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-8 sm:mb-12 px-4 sm:px-0">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
          <span>작업 시간 80% 단축</span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
          <span>영양·알레르기 자동 검증</span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
          <span>원가 자동 최적화</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:items-center sm:justify-center sm:gap-4 mb-16 sm:mb-24 px-4 sm:px-0">
        <Button
          size="lg"
          // 모바일: 두 버튼을 가로로 유지(grid-cols-2)하면서도 글자가 박스 밖으로 튀지 않도록
          // 글자/아이콘/여백을 조금 줄여 한 줄에 안정적으로 들어가게 조정
          className="gap-1.5 sm:gap-2 h-11 sm:h-14 px-2 sm:px-8 w-full sm:w-auto text-xs sm:text-base leading-none whitespace-nowrap"
          onClick={onNewPlan}
        >
          <Plus className="w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0" />
          새로 식단 작성하기
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="gap-1.5 sm:gap-2 h-11 sm:h-14 px-2 sm:px-8 w-full sm:w-auto text-xs sm:text-base leading-none whitespace-nowrap"
          onClick={onLoadSaved}
        >
          <History className="w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0" />
          저장된 식단 불러오기
        </Button>
      </div>

      {/* Scroll Reveal 섹션들 */}
      <div className="w-full mx-auto space-y-32 py-32 px-6">
        {/* 섹션 1: 문제 제기 */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-card sm:bg-card/80 sm:backdrop-blur-sm rounded-3xl p-6 sm:p-12 border border-border/50 shadow-xl">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-green-700 to-green-600 rounded-full text-white text-sm font-semibold shadow-lg">
              문제
            </div>
            <div className="space-y-4 text-left">
              <ScrollReveal
                baseOpacity={0.15}
                enableBlur={true}
                baseRotation={2}
                blurStrength={5}
                containerClassName="text-left"
                textClassName="text-foreground/90"
              >
                영양사 한 명이 매일 3끼씩, 한 달 치 식단을 엑셀로 작성합니다.
              </ScrollReveal>
              <ScrollReveal
                baseOpacity={0.15}
                enableBlur={true}
                baseRotation={2}
                blurStrength={5}
                containerClassName="text-left"
                textClassName="text-foreground/90"
              >
                영양소 계산, 알레르기 확인, 원가 검토까지 매주 8시간이 소요됩니다.
              </ScrollReveal>
              <ScrollReveal
                baseOpacity={0.15}
                enableBlur={true}
                baseRotation={2}
                blurStrength={5}
                containerClassName="text-left"
                textClassName="text-foreground/90"
              >
                더 중요한 영양 상담과 식단 설계에 쓸 시간은 언제 만들까요?
              </ScrollReveal>
            </div>
          </div>
        </div>

        {/* 섹션 2: 우리의 철학 */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-card sm:bg-card/80 sm:backdrop-blur-sm rounded-3xl p-6 sm:p-12 border border-border/50 shadow-xl">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-white text-sm font-semibold shadow-lg">
              원칙
            </div>
            <div className="space-y-4 text-left">
              <ScrollReveal
                baseOpacity={0.15}
                enableBlur={true}
                baseRotation={2}
                blurStrength={5}
                containerClassName="text-left"
                textClassName="text-foreground/90"
              >
                사람은 판단하고, 시스템은 반복을 맡습니다.
              </ScrollReveal>
              <ScrollReveal
                baseOpacity={0.15}
                enableBlur={true}
                baseRotation={2}
                blurStrength={5}
                containerClassName="text-left"
                textClassName="text-foreground/90"
              >
                영양사의 전문성은 규칙으로 코드화하고, 매번 같은 작업은 자동화로 해결합니다.
              </ScrollReveal>
              <ScrollReveal
                baseOpacity={0.15}
                enableBlur={true}
                baseRotation={2}
                blurStrength={5}
                containerClassName="text-left"
                textClassName="text-foreground/90"
              >
                당신의 시간은 환자를 위한 맞춤 상담에, 새로운 식단 연구에, 더 나은 급식 품질 개선에 사용되어야 합니다.
              </ScrollReveal>
            </div>
          </div>
        </div>

        {/* 섹션 3: 핵심 가치 */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-card sm:bg-card/80 sm:backdrop-blur-sm rounded-3xl p-6 sm:p-12 border border-border/50 shadow-xl">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-white text-sm font-semibold shadow-lg">
              솔루션
            </div>
            <div className="space-y-4 text-left">
              <ScrollReveal
                baseOpacity={0.15}
                enableBlur={true}
                baseRotation={2}
                blurStrength={5}
                containerClassName="text-left"
                textClassName="text-foreground/90"
              >
                클릭 몇 번으로 1주부터 4주까지, 영양 균형과 알레르기를 자동 검증하고 원가까지 최적화된 식단을 생성합니다.
              </ScrollReveal>
              <ScrollReveal
                baseOpacity={0.15}
                enableBlur={true}
                baseRotation={2}
                blurStrength={5}
                containerClassName="text-left"
                textClassName="text-foreground/90"
              >
                급식소 규모, 예산, 선호 메뉴까지 반영합니다.
              </ScrollReveal>
              <ScrollReveal
                baseOpacity={0.15}
                enableBlur={true}
                baseRotation={2}
                blurStrength={5}
                containerClassName="text-left"
                textClassName="text-foreground/90"
              >
                생성된 식단은 즉시 수정 가능하며, AI가 대체 메뉴까지 추천해드립니다.
              </ScrollReveal>
            </div>
          </div>
        </div>

        {/* 섹션 4: 구체적 효과 */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-card sm:bg-card/80 sm:backdrop-blur-sm rounded-3xl p-6 sm:p-12 border border-border/50 shadow-xl">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white text-sm font-semibold shadow-lg">
              효과
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-primary/10 rounded-2xl border border-primary/20">
                <div className="text-4xl font-bold text-primary mb-2">80%</div>
                <div className="text-sm text-muted-foreground">작업 시간 단축</div>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-2xl border border-primary/20">
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <div className="text-sm text-muted-foreground">영양 규칙 준수</div>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-2xl border border-primary/20">
                <div className="text-4xl font-bold text-primary mb-2">실시간</div>
                <div className="text-sm text-muted-foreground">원가 최적화</div>
              </div>
            </div>
            <div className="space-y-4 text-left">
              <ScrollReveal
                baseOpacity={0.15}
                enableBlur={true}
                baseRotation={2}
                blurStrength={5}
                containerClassName="text-left"
                textClassName="text-foreground/90"
              >
                매주 8시간 절약, 월 32시간의 여유를 만듭니다.
              </ScrollReveal>
              <ScrollReveal
                baseOpacity={0.15}
                enableBlur={true}
                baseRotation={2}
                blurStrength={5}
                containerClassName="text-left"
                textClassName="text-foreground/90"
              >
                실수 없는 영양 검증, 알레르기 항목 자동 확인, 예산 내 최적 메뉴 조합.
              </ScrollReveal>
              <ScrollReveal
                baseOpacity={0.15}
                enableBlur={true}
                baseRotation={2}
                blurStrength={5}
                containerClassName="text-left"
                textClassName="text-foreground/90"
              >
                영양사는 시스템이 아닌 전문가로서 일할 수 있습니다.
              </ScrollReveal>
            </div>
          </div>
        </div>

        {/* 섹션 5: 실제 사용 사례 */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-card/80 backdrop-blur-sm rounded-3xl p-12 border border-border/50 shadow-xl">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-sm font-semibold shadow-lg">
              적용
            </div>
            <div className="space-y-4 text-left">
              <ScrollReveal
                baseOpacity={0.15}
                enableBlur={true}
                baseRotation={2}
                blurStrength={5}
                containerClassName="text-left"
                textClassName="text-foreground/90"
              >
                학교 급식, 병원 환자식, 기업 구내식당, 요양원까지 규모와 관계없이 적용 가능합니다.
              </ScrollReveal>
              <ScrollReveal
                baseOpacity={0.15}
                enableBlur={true}
                baseRotation={2}
                blurStrength={5}
                containerClassName="text-left"
                textClassName="text-foreground/90"
              >
               
                100명의 한 끼부터 5,000명의 한 달 식단까지, 같은 시간 안에 생성됩니다.
              </ScrollReveal>
              <ScrollReveal
                baseOpacity={0.15}
                enableBlur={true}
                baseRotation={2}
                blurStrength={5}
                containerClassName="text-left"
                textClassName="text-foreground/90"
              >
                지속적인 기능 개선과 업데이트로 더 나은 서비스를 제공합니다.
              </ScrollReveal>
            </div>
          </div>
        </div>

        {/* 섹션 6: 시작하기 */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-primary/10 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-gradient-to-br from-primary/20 via-card/80 to-card/80 backdrop-blur-sm rounded-3xl p-12 border border-primary/30 shadow-2xl">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-green-700 to-green-600 rounded-full text-white text-sm font-semibold shadow-lg">
              시작하기
            </div>
            <div className="space-y-4 text-left">
              <ScrollReveal
                baseOpacity={0.15}
                enableBlur={true}
                baseRotation={2}
                blurStrength={5}
                containerClassName="text-left"
                textClassName="text-foreground/90"
              >
                지금 바로 시작하세요.
              </ScrollReveal>
              <ScrollReveal
                baseOpacity={0.15}
                enableBlur={true}
                baseRotation={2}
                blurStrength={5}
                containerClassName="text-left"
                textClassName="text-foreground/90"
              >
                회원가입 후 몇 분이면 첫 식단을 생성할 수 있습니다.
              </ScrollReveal>
              <ScrollReveal
                baseOpacity={0.15}
                enableBlur={true}
                baseRotation={2}
                blurStrength={5}
                containerClassName="text-left"
                textClassName="text-foreground/90"
              >
                복잡한 설정은 필요 없습니다.
              </ScrollReveal>
              <ScrollReveal
                baseOpacity={0.15}
                enableBlur={true}
                baseRotation={2}
                blurStrength={5}
                containerClassName="text-left"
                textClassName="text-foreground/90"
              >
                급식소 정보와 예산만 입력하면, 나머지는 AutoDiet가 처리합니다.
              </ScrollReveal>
              <ScrollReveal
                baseOpacity={0.15}
                enableBlur={true}
                baseRotation={2}
                blurStrength={5}
                containerClassName="text-left"
                textClassName="text-foreground/90"
              >
                생성된 식단은 바로 수정하고, 저장하고, 내보낼 수 있습니다.
              </ScrollReveal>
            </div>
            <div className="flex justify-center gap-4 mt-8">
              <Button
                size="lg"
                onClick={onNewPlan}
                className="gap-2 h-12 px-8 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                START
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* 페이지 최하단(푸터): 운영자/문의 (한 줄, 작게) */}
      <footer className="relative z-10 border-t border-border/50 -mb-8">
        <div className="max-w-3xl mx-auto px-6 py-3">
          <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 text-center sm:text-left">
              {/* 모바일에서는 2줄로 자연스럽게 쌓이도록(운영 / 문의) */}
              <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-2">
                <span className="whitespace-nowrap">
                  운영: <span className="text-foreground">이시욱</span>
                </span>
                {/* 구분선은 모바일에서 줄바꿈을 망가뜨리기 쉬워서 sm 이상에서만 표시 */}
                <span className="hidden opacity-60 sm:inline">|</span>
                <span className="min-w-0">
                  문의:{' '}
                  <a
                    className="text-primary hover:underline break-all"
                    href="mailto:dltldnr11@gmail.com"
                  >
                    dltldnr11@gmail.com
                  </a>
                </span>
              </div>
            </div>

            {/* 모바일에서는 별도 줄로 내려와도 자연스럽게 보이도록 */}
            <a className="text-primary hover:underline self-center sm:self-auto" href="/privacy">
              개인정보처리방침
            </a>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}









