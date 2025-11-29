import { SettingItem, Select, Toggle } from '@/components/ui/SettingsComponents'

interface ConnectFourGameConfig {
  aiDifficulty: 'easy' | 'medium' | 'hard'
  aiEnabled: boolean
}

interface ConnectFourSettingsProps {
  config: ConnectFourGameConfig
  onConfigChange: (config: ConnectFourGameConfig) => void
}

export default function ConnectFourSettings({ config, onConfigChange }: ConnectFourSettingsProps) {
  return (
    <div className="space-y-4">
      <SettingItem
        label="AI Opponent"
        description="Enable AI opponent or play with a friend"
      >
        <Toggle
          value={config.aiEnabled}
          onChange={(value) => onConfigChange({ ...config, aiEnabled: value })}
          label={config.aiEnabled ? 'AI Enabled' : 'Two Player Mode'}
        />
      </SettingItem>

      {config.aiEnabled && (
        <SettingItem
          label="AI Difficulty"
          description="How smart the AI is"
        >
          <Select
            value={config.aiDifficulty}
            onChange={(value) => onConfigChange({ ...config, aiDifficulty: value as ConnectFourGameConfig['aiDifficulty'] })}
            options={[
              { value: 'easy', label: 'Easy' },
              { value: 'medium', label: 'Medium' },
              { value: 'hard', label: 'Hard' },
            ]}
          />
        </SettingItem>
      )}
    </div>
  )
}

