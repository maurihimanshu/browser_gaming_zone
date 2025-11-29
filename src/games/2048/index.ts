import { GameModule } from '@/types/game'
import Game2048 from './Game2048'

const game2048: GameModule = {
  metadata: {
    id: '2048',
    name: '2048',
    description: 'Slide numbered tiles to combine them and reach 2048! Use arrow keys or swipe.',
    category: 'Puzzle',
    difficulty: 'Medium',
    players: 1,
    estimatedTime: '10-15 min',
    mobileCompatible: true, // Can add touch controls
  },
  component: Game2048,
}

export default game2048

