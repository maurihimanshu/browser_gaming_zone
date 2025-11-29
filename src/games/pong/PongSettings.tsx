import { SettingItem, Slider, Select } from '@/components/ui/SettingsComponents'

interface PongGameConfig {
  ballSpeed: number
  paddleSize: number
  aiDifficulty: number
}

interface PongSettingsProps {
  config: PongGameConfig
  onConfigChange: (config: PongGameConfig) => void
}

export default function PongSettings({ config, onConfigChange }: PongSettingsProps) {
  return (
    <div className="space-y-4">
      <SettingItem
        label="Ball Speed"
        description="How fast the ball moves in pixels per second (higher = faster)"
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
        label="Paddle Size"
        description="Height of paddles (higher = easier to hit)"
      >
        <Slider
          value={config.paddleSize}
          onChange={(value) => onConfigChange({ ...config, paddleSize: value })}
          min={40}
          max={120}
          step={10}
          unit="px"
        />
      </SettingItem>

      <SettingItem
        label="AI Difficulty"
        description="How well the AI plays (higher = harder)"
      >
        <Select
          value={config.aiDifficulty.toString()}
          onChange={(value) => onConfigChange({ ...config, aiDifficulty: Number(value) })}
          options={[
            { value: '0.5', label: 'Easy (50% speed)' },
            { value: '0.7', label: 'Medium (70% speed)' },
            { value: '0.8', label: 'Hard (80% speed)' },
            { value: '0.9', label: 'Expert (90% speed)' },
            { value: '1.0', label: 'Master (100% speed)' },
          ]}
        />
      </SettingItem>
    </div>
  )
}

