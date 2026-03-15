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
 * Minimal Clean Version
 * - 정보 밀도/가독성을 위해 여백을 줄인 형태(래핑 컨테이너만 최소 스타일 적용)
 * - 내부 로직은 기존 SettingsPanel을 재사용합니다.
 */
export function MinimalSettingsPanel(props: SettingsPanelProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <SettingsPanel {...props} />
    </div>
  );
}










