import { GameModule } from '@/types/game'
import TetrisGame from './TetrisGame'

const tetrisGame: GameModule = {
  metadata: {
    id: 'tetris',
    name: 'Tetris',
    description: 'Classic Tetris puzzle game. Rotate and place falling pieces to clear lines!',
    category: 'Arcade',
    difficulty: 'Medium',
    players: 1,
    estimatedTime: '5-15 min',
    mobileCompatible: true,
  },
  component: TetrisGame,
}

export default tetrisGame

