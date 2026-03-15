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
 * Source Version (Original SettingsPanel)
 * - 현재 프로덕션에서 사용하는 SettingsPanel을 그대로 렌더링합니다.
 * - variations/showcase.tsx에서 비교 표시용으로 사용됩니다.
 */
export function SourceSettingsPanel(props: SettingsPanelProps) {
  return <SettingsPanel {...props} />;
}










