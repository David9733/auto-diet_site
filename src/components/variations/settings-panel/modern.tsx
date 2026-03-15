'use client';

import type { StoreSettings } from '@/types/meal';
import { SettingsPanel } from '@/components/dashboard/SettingsPanel';

interface SettingsPanelProps {
  settings: StoreSettings;
  onSettingsChange: (settings: StoreSettings) => void;
  onGenerate: (weeks: number) => void;
  isGenerating: boolean;
}

/**
 * Modern Gradient Version
 * - 그라데이션/카드 느낌을 주는 외곽 컨테이너만 적용
 * - 로직은 SettingsPanel 재사용 (배포 빌드 안정성 우선)
 */
export function ModernSettingsPanel(props: SettingsPanelProps) {
  return (
    <div className="gradient-card border border-border/50 rounded-2xl p-4 shadow-soft">
      <SettingsPanel {...props} />
    </div>
  );
}










