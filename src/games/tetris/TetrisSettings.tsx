import { SettingItem, Slider } from '@/components/ui/SettingsComponents'

interface TetrisGameConfig {
  gridWidth: number
  gridHeight: number
  gameSpeed: number
}

interface TetrisSettingsProps {
  config: TetrisGameConfig
  onConfigChange: (config: TetrisGameConfig) => void
}

export default function TetrisSettings({ config, onConfigChange }: TetrisSettingsProps) {
  return (
    <div className="space-y-4">
      <SettingItem
        label="Grid Width"
        description="Number of columns (standard is 10)"
      >
        <Slider
          value={config.gridWidth}
          onChange={(value) => onConfigChange({ ...config, gridWidth: value })}
          min={8}
          max={15}
          step={1}
        />
      </SettingItem>

      <SettingItem
        label="Grid Height"
        description="Number of rows (standard is 20)"
      >
        <Slider
          value={config.gridHeight}
          onChange={(value) => onConfigChange({ ...config, gridHeight: value })}
          min={15}
          max={30}
          step={1}
        />
      </SettingItem>

      <SettingItem
        label="Initial Speed"
        description="Starting fall speed in milliseconds (lower = faster)"
      >
        <Slider
          value={config.gameSpeed}
          onChange={(value) => onConfigChange({ ...config, gameSpeed: value })}
          min={200}
          max={2000}
          step={100}
          unit="ms"
        />
      </SettingItem>
    </div>
  )
}

