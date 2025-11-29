import { ComponentType } from 'react'

export interface GameMetadata {
  id: string
  name: string
  description: string
  category: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  players: number
  estimatedTime: string
  thumbnail?: string
  mobileCompatible: boolean // Whether the game works well on mobile devices
}

export interface GameModule {
  metadata: GameMetadata
  component: ComponentType
}

export interface GameRegistry {
  [gameId: string]: GameModule
}

