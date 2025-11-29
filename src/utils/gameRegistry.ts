import { GameRegistry, GameModule } from '@/types/game'

// Import game modules
import snakeGame from '@/games/snake'
import ticTacToeGame from '@/games/tic-tac-toe'
import memoryGame from '@/games/memory'
import pongGame from '@/games/pong'
import game2048 from '@/games/2048'
import tetrisGame from '@/games/tetris'
import minesweeperGame from '@/games/minesweeper'
import connectFourGame from '@/games/connect-four'
import hangmanGame from '@/games/hangman'
import breakoutGame from '@/games/breakout'

// Central registry of all games
const gameRegistry: GameRegistry = {
  [snakeGame.metadata.id]: snakeGame,
  [ticTacToeGame.metadata.id]: ticTacToeGame,
  [memoryGame.metadata.id]: memoryGame,
  [pongGame.metadata.id]: pongGame,
  [game2048.metadata.id]: game2048,
  [tetrisGame.metadata.id]: tetrisGame,
  [minesweeperGame.metadata.id]: minesweeperGame,
  [connectFourGame.metadata.id]: connectFourGame,
  [hangmanGame.metadata.id]: hangmanGame,
  [breakoutGame.metadata.id]: breakoutGame,
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

