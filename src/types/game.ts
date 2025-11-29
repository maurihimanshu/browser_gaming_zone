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
}

export interface GameModule {
  metadata: GameMetadata
  component: ComponentType
}

export interface GameRegistry {
  [gameId: string]: GameModule
}

