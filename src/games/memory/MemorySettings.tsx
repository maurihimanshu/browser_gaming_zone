import { SettingItem, Select } from '@/components/ui/SettingsComponents'

interface MemoryGameConfig {
  gridSize: number
}

interface MemorySettingsProps {
  config: MemoryGameConfig
  onConfigChange: (config: MemoryGameConfig) => void
}

/**
 * Memory game-specific settings panel.
 */
export default function MemorySettings({ config, onConfigChange }: MemorySettingsProps) {
  return (
    <div className="space-y-4">
      <SettingItem
        label="Grid Size"
        description="Number of card pairs (affects difficulty - more pairs = harder)"
      >
        <Select
          value={config.gridSize}
          onChange={(value) => onConfigChange({ ...config, gridSize: Number(value) })}
          options={[
            { value: 4, label: '2x2 Grid (4 pairs - Easy)' },
            { value: 6, label: '3x2 Grid (6 pairs - Medium)' },
            { value: 8, label: '4x2 Grid (8 pairs - Normal)' },
            { value: 12, label: '4x3 Grid (12 pairs - Hard)' },
            { value: 16, label: '4x4 Grid (16 pairs - Expert)' },
            { value: 18, label: '6x3 Grid (18 pairs - Master)' },
          ]}
        />
      </SettingItem>
    </div>
  )
}

