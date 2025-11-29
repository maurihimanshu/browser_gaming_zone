import { GameModule } from '@/types/game'
import TicTacToeGame from './TicTacToeGame'

const ticTacToeGame: GameModule = {
  metadata: {
    id: 'tic-tac-toe',
    name: 'Tic-Tac-Toe',
    description: 'Classic Tic-Tac-Toe game. Play against a friend or challenge the AI!',
    category: 'Strategy',
    difficulty: 'Easy',
    players: 2,
    estimatedTime: '2-5 min',
    mobileCompatible: true, // Touch-friendly, works on mobile
  },
  component: TicTacToeGame,
}

export default ticTacToeGame

