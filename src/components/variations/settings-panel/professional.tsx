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
 * Professional Dark Version
 * - 다크 톤 배경 위에서 보기에 좋도록 외곽 컨테이너만 다크 스타일 적용
 * - 내부 입력/버튼 동작은 기존 SettingsPanel을 그대로 사용합니다.
 */
export function ProfessionalSettingsPanel(props: SettingsPanelProps) {
  return (
    <div className="bg-gray-900/60 border border-gray-700 rounded-2xl p-4">
      <div className="bg-transparent">
        <SettingsPanel {...props} />
      </div>
    </div>
  );
}










