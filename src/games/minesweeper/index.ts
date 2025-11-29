import { GameModule } from '@/types/game'
import MinesweeperGame from './MinesweeperGame'

const minesweeperGame: GameModule = {
  metadata: {
    id: 'minesweeper',
    name: 'Minesweeper',
    description: 'Classic Minesweeper puzzle. Find all mines without detonating them!',
    category: 'Puzzle',
    difficulty: 'Medium',
    players: 1,
    estimatedTime: '5-15 min',
    mobileCompatible: true,
  },
  component: MinesweeperGame,
}

export default minesweeperGame

