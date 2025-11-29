import { SettingItem, Toggle, Slider, Select } from '@/components/ui/SettingsComponents'

interface SnakeGameConfig {
  gridSize: number
  cellSize: number
  gameSpeed: number
  boundariesEnabled: boolean
}

interface SnakeSettingsProps {
  config: SnakeGameConfig
  onConfigChange: (config: SnakeGameConfig) => void
}

/**
 * Snake game-specific settings panel.
 * This component is specific to the Snake game and should be kept in the games/snake directory.
 */
export default function SnakeSettings({ config, onConfigChange }: SnakeSettingsProps) {
  return (
    <div className="space-y-4">
      <SettingItem
        label="Boundaries"
        description="Enable walls (game over on collision) or disable (wrap around edges)"
      >
        <Toggle
          value={config.boundariesEnabled}
          onChange={(value) => onConfigChange({ ...config, boundariesEnabled: value })}
          label={config.boundariesEnabled ? 'Walls Enabled' : 'Wrapping Enabled'}
        />
      </SettingItem>

      <SettingItem
        label="Game Speed"
        description="Lower values = faster gameplay (milliseconds per move)"
      >
        <Slider
          value={config.gameSpeed}
          onChange={(value) => onConfigChange({ ...config, gameSpeed: value })}
          min={50}
          max={500}
          step={10}
          unit="ms"
        />
      </SettingItem>

      <SettingItem
        label="Grid Size"
        description="Number of cells per row/column (affects game difficulty)"
      >
        <Select
          value={config.gridSize}
          onChange={(value) => onConfigChange({ ...config, gridSize: Number(value) })}
          options={[
            { value: 10, label: '10x10 (Easy)' },
            { value: 15, label: '15x15 (Medium)' },
            { value: 20, label: '20x20 (Normal)' },
            { value: 25, label: '25x25 (Hard)' },
            { value: 30, label: '30x30 (Expert)' },
          ]}
        />
      </SettingItem>

      <SettingItem label="Cell Size" description="Visual size of each cell in pixels">
        <Slider
          value={config.cellSize}
          onChange={(value) => onConfigChange({ ...config, cellSize: value })}
          min={10}
          max={40}
          step={2}
          unit="px"
        />
      </SettingItem>
    </div>
  )
}

