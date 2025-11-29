import { GameRegistry, GameModule } from '@/types/game'

// Import game modules
import snakeGame from '@/games/snake'
import ticTacToeGame from '@/games/tic-tac-toe'

// Central registry of all games
const gameRegistry: GameRegistry = {
  [snakeGame.metadata.id]: snakeGame,
  [ticTacToeGame.metadata.id]: ticTacToeGame,
}

export const getAllGames = (): GameModule[] => {
  return Object.values(gameRegistry)
}

export const getGameById = (id: string): GameModule | undefined => {
  return gameRegistry[id]
}

export const getGamesByCategory = (category: string): GameModule[] => {
  return Object.values(gameRegistry).filter(
    (game) => game.metadata.category === category
  )
}

export default gameRegistry

