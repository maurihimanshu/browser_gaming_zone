import { GameModule } from '@/types/game'
import BreakoutGame from './BreakoutGame'

const breakoutGame: GameModule = {
  metadata: {
    id: 'breakout',
    name: 'Breakout',
    description: 'Classic Breakout arcade game. Break all the bricks with the ball!',
    category: 'Arcade',
    difficulty: 'Medium',
    players: 1,
    estimatedTime: '5-15 min',
    mobileCompatible: false, // Requires keyboard controls
  },
  component: BreakoutGame,
}

export default breakoutGame

