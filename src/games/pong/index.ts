import { GameModule } from '@/types/game'
import PongGame from './PongGame'

const pongGame: GameModule = {
  metadata: {
    id: 'pong',
    name: 'Pong',
    description: 'Classic Pong game! Use arrow keys to move your paddle and score points.',
    category: 'Arcade',
    difficulty: 'Medium',
    players: 1,
    estimatedTime: '5-10 min',
    mobileCompatible: false, // Requires keyboard controls
  },
  component: PongGame,
}

export default pongGame

