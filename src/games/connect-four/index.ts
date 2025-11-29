import { GameModule } from '@/types/game'
import ConnectFourGame from './ConnectFourGame'

const connectFourGame: GameModule = {
  metadata: {
    id: 'connect-four',
    name: 'Connect Four',
    description: 'Classic Connect Four game. Drop pieces to connect 4 in a row!',
    category: 'Strategy',
    difficulty: 'Medium',
    players: 2,
    estimatedTime: '5-10 min',
    mobileCompatible: true,
  },
  component: ConnectFourGame,
}

export default connectFourGame

