import { ReactNode } from 'react'

/**
 * Generic, reusable UI components for game settings.
 * These can be used by any game that needs settings.
 */

interface SettingItemProps {
  label: string
  description?: string
  children: ReactNode
}

export function SettingItem({ label, description, children }: SettingItemProps) {
  return (
    <div className="mb-4">
      <label className="block text-white font-semibold mb-1">{label}</label>
      {description && <p className="text-white/60 text-sm mb-2">{description}</p>}
      <div>{children}</div>
    </div>
  )
}

interface ToggleProps {
  value: boolean
  onChange: (value: boolean) => void
  label?: string
}

export function Toggle({ value, onChange, label }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-14 h-7 rounded-full transition-colors ${
            value ? 'bg-purple-600' : 'bg-gray-600'
          }`}
        >
          <div
            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
              value ? 'translate-x-7' : 'translate-x-0'
            }`}
          />
        </div>
      </div>
      {label && <span className="text-white">{label}</span>}
    </label>
  )
}

interface SliderProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  unit?: string
}

export function Slider({ value, onChange, min, max, step = 1, unit = '' }: SliderProps) {
  return (
    <div className="flex items-center gap-4">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-600"
      />
      <span className="text-white font-semibold min-w-[60px] text-right">
        {value}
        {unit}
      </span>
    </div>
  )
}

interface SelectProps {
  value: string | number
  onChange: (value: string | number) => void
  options: { value: string | number; label: string }[]
}

export function Select({ value, onChange, options }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-gray-800">
          {option.label}
        </option>
      ))}
    </select>
  )
}

