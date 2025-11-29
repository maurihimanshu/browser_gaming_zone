import { SettingItem, Select, Slider } from '@/components/ui/SettingsComponents'

interface HangmanGameConfig {
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  maxWrongGuesses: number
}

interface HangmanSettingsProps {
  config: HangmanGameConfig
  onConfigChange: (config: HangmanGameConfig) => void
}

const WORD_CATEGORIES = ['Animals', 'Countries', 'Food', 'Sports', 'Technology', 'Nature']

export default function HangmanSettings({ config, onConfigChange }: HangmanSettingsProps) {
  return (
    <div className="space-y-4">
      <SettingItem
        label="Category"
        description="Choose word category"
      >
        <Select
          value={config.category}
          onChange={(value) => onConfigChange({ ...config, category: String(value) })}
          options={WORD_CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
        />
      </SettingItem>

      <SettingItem
        label="Difficulty"
        description="Word length difficulty"
      >
        <Select
          value={config.difficulty}
          onChange={(value) => onConfigChange({ ...config, difficulty: value as HangmanGameConfig['difficulty'] })}
          options={[
            { value: 'easy', label: 'Easy (≤5 letters)' },
            { value: 'medium', label: 'Medium (6-7 letters)' },
            { value: 'hard', label: 'Hard (8+ letters)' },
          ]}
        />
      </SettingItem>

      <SettingItem
        label="Max Wrong Guesses"
        description="Number of incorrect guesses allowed"
      >
        <Slider
          value={config.maxWrongGuesses}
          onChange={(value) => onConfigChange({ ...config, maxWrongGuesses: value })}
          min={4}
          max={10}
          step={1}
        />
      </SettingItem>
    </div>
  )
}

