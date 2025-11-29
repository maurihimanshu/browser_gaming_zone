import { SettingItem, Slider } from '@/components/ui/SettingsComponents'

interface BreakoutGameConfig {
  paddleWidth: number
  ballSpeed: number
  paddleSpeed: number
}

interface BreakoutSettingsProps {
  config: BreakoutGameConfig
  onConfigChange: (config: BreakoutGameConfig) => void
}

export default function BreakoutSettings({ config, onConfigChange }: BreakoutSettingsProps) {
  return (
    <div className="space-y-4">
      <SettingItem
        label="Paddle Width"
        description="Width of the paddle (higher = easier)"
      >
        <Slider
          value={config.paddleWidth}
          onChange={(value) => onConfigChange({ ...config, paddleWidth: value })}
          min={50}
          max={200}
          step={10}
          unit="px"
        />
      </SettingItem>

      <SettingItem
        label="Ball Speed"
        description="Initial ball speed in pixels per second"
      >
        <Slider
          value={config.ballSpeed}
          onChange={(value) => onConfigChange({ ...config, ballSpeed: value })}
          min={200}
          max={600}
          step={50}
          unit=" px/s"
        />
      </SettingItem>

      <SettingItem
        label="Paddle Speed"
        description="Paddle movement speed in pixels per second"
      >
        <Slider
          value={config.paddleSpeed}
          onChange={(value) => onConfigChange({ ...config, paddleSpeed: value })}
          min={200}
          max={800}
          step={50}
          unit=" px/s"
        />
      </SettingItem>
    </div>
  )
}

