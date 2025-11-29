import { GameModule } from '@/types/game'
import SnakeGame from './SnakeGame'

const snakeGame: GameModule = {
  metadata: {
    id: 'snake',
    name: 'Snake',
    description: 'Classic Snake game. Eat food to grow longer, but avoid hitting the walls or yourself!',
    category: 'Arcade',
    difficulty: 'Easy',
    players: 1,
    estimatedTime: '5-10 min',
  },
  component: SnakeGame,
}

export default snakeGame

