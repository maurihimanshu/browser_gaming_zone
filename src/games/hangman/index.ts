import { GameModule } from '@/types/game'
import HangmanGame from './HangmanGame'

const hangmanGame: GameModule = {
  metadata: {
    id: 'hangman',
    name: 'Hangman',
    description: 'Classic word guessing game. Guess the word before running out of attempts!',
    category: 'Word',
    difficulty: 'Easy',
    players: 1,
    estimatedTime: '3-5 min',
    mobileCompatible: true,
  },
  component: HangmanGame,
}

export default hangmanGame

