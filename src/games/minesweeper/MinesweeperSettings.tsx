import { SettingItem, Select, Slider } from '@/components/ui/SettingsComponents'

interface MinesweeperGameConfig {
  gridSize: 'beginner' | 'intermediate' | 'expert' | 'custom'
  customWidth: number
  customHeight: number
  customMines: number
}

interface MinesweeperSettingsProps {
  config: MinesweeperGameConfig
  onConfigChange: (config: MinesweeperGameConfig) => void
}

export default function MinesweeperSettings({ config, onConfigChange }: MinesweeperSettingsProps) {
  return (
    <div className="space-y-4">
      <SettingItem
        label="Difficulty"
        description="Choose preset difficulty or custom"
      >
        <Select
          value={config.gridSize}
          onChange={(value) => {
            const newConfig = { ...config, gridSize: value as MinesweeperGameConfig['gridSize'] }
            if (value !== 'custom') {
              onConfigChange(newConfig)
            } else {
              onConfigChange(newConfig)
            }
          }}
          options={[
            { value: 'beginner', label: 'Beginner (9x9, 10 mines)' },
            { value: 'intermediate', label: 'Intermediate (16x16, 40 mines)' },
            { value: 'expert', label: 'Expert (30x16, 99 mines)' },
            { value: 'custom', label: 'Custom' },
          ]}
        />
      </SettingItem>

      {config.gridSize === 'custom' && (
        <>
          <SettingItem
            label="Width"
            description="Number of columns"
          >
            <Slider
              value={config.customWidth}
              onChange={(value) => onConfigChange({ ...config, customWidth: value })}
              min={5}
              max={30}
              step={1}
            />
          </SettingItem>

          <SettingItem
            label="Height"
            description="Number of rows"
          >
            <Slider
              value={config.customHeight}
              onChange={(value) => onConfigChange({ ...config, customHeight: value })}
              min={5}
              max={30}
              step={1}
            />
          </SettingItem>

          <SettingItem
            label="Mines"
            description="Number of mines"
          >
            <Slider
              value={config.customMines}
              onChange={(value) => onConfigChange({ ...config, customMines: value })}
              min={1}
              max={Math.min(config.customWidth * config.customHeight - 1, 200)}
              step={1}
            />
          </SettingItem>
        </>
      )}
    </div>
  )
}

