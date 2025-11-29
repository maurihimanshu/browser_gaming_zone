import { GameModule } from '@/types/game'
import MemoryGame from './MemoryGame'

const memoryGame: GameModule = {
  metadata: {
    id: 'memory',
    name: 'Memory Game',
    description: 'Test your memory! Match pairs of cards by remembering their positions.',
    category: 'Puzzle',
    difficulty: 'Easy',
    players: 1,
    estimatedTime: '3-5 min',
    mobileCompatible: true, // Touch-friendly
  },
  component: MemoryGame,
}

export default memoryGame

