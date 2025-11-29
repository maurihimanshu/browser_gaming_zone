import { GameRegistry, GameModule } from '@/types/game'

// Import game modules
import snakeGame from '@/games/snake'
import ticTacToeGame from '@/games/tic-tac-toe'
import memoryGame from '@/games/memory'
import pongGame from '@/games/pong'
import game2048 from '@/games/2048'

// Central registry of all games
const gameRegistry: GameRegistry = {
  [snakeGame.metadata.id]: snakeGame,
  [ticTacToeGame.metadata.id]: ticTacToeGame,
  [memoryGame.metadata.id]: memoryGame,
  [pongGame.metadata.id]: pongGame,
  [game2048.metadata.id]: game2048,
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

