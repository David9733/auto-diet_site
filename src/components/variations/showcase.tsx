'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StoreSettings } from '@/types/meal';

// WelcomeScreen Variations
import { SourceWelcomeScreen } from './welcome-screen/source';
import { MinimalWelcomeScreen } from './welcome-screen/minimal';
import { ProfessionalWelcomeScreen } from './welcome-screen/professional';
import { ModernWelcomeScreen } from './welcome-screen/modern';

// SettingsPanel Variations
import { SourceSettingsPanel } from './settings-panel/source';
import { MinimalSettingsPanel } from './settings-panel/minimal';
import { ProfessionalSettingsPanel } from './settings-panel/professional';
import { ModernSettingsPanel } from './settings-panel/modern';

/**
 * Design Variations Showcase
 * Compare all design variations side by side
 */
export function DesignVariationsShowcase() {
  const [activeTab, setActiveTab] = useState<'welcome' | 'settings'>('welcome');

  // Sample data for testing
  const sampleSettings: StoreSettings = {
    id: 'demo-1',
    storeName: '데모 급식소',
    mealsPerDay: 3,
    mealCombination: 'all',
    singleMealType: 'lunch',
    daysPerWeek: 5,
    sideDishCount: 4,
    sideDishCountAuto: true,
    servingCount: 100,
    budgetPerMeal: 5000,
    costRatio: 35,
    snackMorning: false,
    snackAfternoon: false,
    snackEvening: false,
  };

  const handleNewPlan = () => {
    alert('새로운 식단 작성 시작!');
  };

  const handleLoadSaved = () => {
    alert('저장된 식단 불러오기!');
  };

  const handleSettingsChange = (settings: StoreSettings) => {
    console.log('Settings changed:', settings);
  };

  const handleGenerate = (weeks: number) => {
    alert(`${weeks}주 식단 생성!`);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-inter bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            Design Variations Showcase
          </h1>
          <p className="text-lg text-muted-foreground font-noto">
            AutoDiet 컴포넌트의 3가지 디자인 변형을 비교해보세요
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => setActiveTab('welcome')}
            variant={activeTab === 'welcome' ? 'default' : 'outline'}
            size="lg"
            className="font-inter"
          >
            Welcome Screen (소개 페이지)
          </Button>
          <Button
            onClick={() => setActiveTab('settings')}
            variant={activeTab === 'settings' ? 'default' : 'outline'}
            size="lg"
            className="font-inter"
          >
            Settings Panel (식단 설정)
          </Button>
        </div>

        {/* Welcome Screen Variations */}
        {activeTab === 'welcome' && (
          <div className="space-y-16">
            {/* Original Design */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-full bg-gray-200 text-gray-800 text-sm font-semibold font-inter">
                  ORIGINAL
                </div>
                <h2 className="text-2xl font-bold font-noto">원본 디자인</h2>
              </div>
              <p className="text-muted-foreground font-noto">
                현재 프로덕션 디자인 - GridMotion 애니메이션 배경
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden">
                <SourceWelcomeScreen onNewPlan={handleNewPlan} onLoadSaved={handleLoadSaved} />
              </div>
            </section>

            {/* Minimal Clean */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold font-inter">
                  VARIATION 1
                </div>
                <h2 className="text-2xl font-bold font-noto">Minimal Clean</h2>
              </div>
              <p className="text-muted-foreground font-noto">
                정보 밀도 최대화 - 컴팩트 레이아웃, subtle borders, 애니메이션 없음
              </p>
              <div className="border-2 border-dashed border-blue-300 rounded-2xl overflow-hidden">
                <MinimalWelcomeScreen onNewPlan={handleNewPlan} onLoadSaved={handleLoadSaved} />
              </div>
            </section>

            {/* Professional Dark */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-semibold font-inter">
                  VARIATION 2
                </div>
                <h2 className="text-2xl font-bold font-noto">Professional Dark</h2>
              </div>
              <p className="text-muted-foreground font-noto">
                다크 모드 - 장시간 사용 시 눈의 피로 감소, elevated shadows
              </p>
              <div className="border-2 border-dashed border-purple-300 rounded-2xl overflow-hidden">
                <ProfessionalWelcomeScreen onNewPlan={handleNewPlan} onLoadSaved={handleLoadSaved} />
              </div>
            </section>

            {/* Modern Gradient */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold font-inter">
                  VARIATION 3
                </div>
                <h2 className="text-2xl font-bold font-noto">Modern Gradient</h2>
              </div>
              <p className="text-muted-foreground font-noto">
                브랜드 아이덴티티 강화 - 그라데이션 배경, 컬러풀 아이콘, hover effects
              </p>
              <div className="border-2 border-dashed border-green-300 rounded-2xl overflow-hidden">
                <ModernWelcomeScreen onNewPlan={handleNewPlan} onLoadSaved={handleLoadSaved} />
              </div>
            </section>
          </div>
        )}

        {/* Settings Panel Variations */}
        {activeTab === 'settings' && (
          <div className="space-y-16">
            {/* Original Design */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-full bg-gray-200 text-gray-800 text-sm font-semibold font-inter">
                  ORIGINAL
                </div>
                <h2 className="text-2xl font-bold font-noto">원본 디자인</h2>
              </div>
              <p className="text-muted-foreground font-noto">
                현재 프로덕션 디자인 - 카드 기반 레이아웃
              </p>
              <div className="max-w-3xl mx-auto border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden p-4">
                <SourceSettingsPanel
                  settings={sampleSettings}
                  onSettingsChange={handleSettingsChange}
                  onGenerate={handleGenerate}
                  isGenerating={false}
                />
              </div>
            </section>

            {/* Minimal Clean */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold font-inter">
                  VARIATION 1
                </div>
                <h2 className="text-2xl font-bold font-noto">Minimal Clean</h2>
              </div>
              <p className="text-muted-foreground font-noto">
                컴팩트 레이아웃 - 타이트 spacing, subtle borders, 그림자 없음
              </p>
              <div className="max-w-3xl mx-auto border-2 border-dashed border-blue-300 rounded-2xl overflow-hidden p-4">
                <MinimalSettingsPanel
                  settings={sampleSettings}
                  onSettingsChange={handleSettingsChange}
                  onGenerate={handleGenerate}
                  isGenerating={false}
                />
              </div>
            </section>

            {/* Professional Dark */}
            <section className="space-y-4 bg-gray-950 p-8 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm font-semibold font-inter border border-purple-500/30">
                  VARIATION 2
                </div>
                <h2 className="text-2xl font-bold font-noto text-white">Professional Dark</h2>
              </div>
              <p className="text-gray-400 font-noto">
                다크 모드 - 큰 폰트, elevated shadows, green accents
              </p>
              <div className="max-w-3xl mx-auto border-2 border-dashed border-purple-500/30 rounded-2xl overflow-hidden p-4">
                <ProfessionalSettingsPanel
                  settings={sampleSettings}
                  onSettingsChange={handleSettingsChange}
                  onGenerate={handleGenerate}
                  isGenerating={false}
                />
              </div>
            </section>

            {/* Modern Gradient */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold font-inter">
                  VARIATION 3
                </div>
                <h2 className="text-2xl font-bold font-noto">Modern Gradient</h2>
              </div>
              <p className="text-muted-foreground font-noto">
                컬러풀 카드 - 그라데이션 배경, 다양한 색상, hover animations
              </p>
              <div className="max-w-3xl mx-auto border-2 border-dashed border-green-300 rounded-2xl overflow-hidden p-4">
                <ModernSettingsPanel
                  settings={sampleSettings}
                  onSettingsChange={handleSettingsChange}
                  onGenerate={handleGenerate}
                  isGenerating={false}
                />
              </div>
            </section>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-8 border-t border-border">
          <p className="text-sm text-muted-foreground font-noto">
            AutoDiet Design Variations - Created following design-variations.mdc rules
          </p>
        </div>
      </div>
    </div>
  );
}









