import { useState, useEffect, useCallback } from 'react'

type Player = 'X' | 'O' | null
type Board = Player[]

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6], // diagonals
]

export default function TicTacToeGame() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X')
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null)
  const [isAiMode, setIsAiMode] = useState(false)
  const [xScore, setXScore] = useState(0)
  const [oScore, setOScore] = useState(0)

  const checkWinner = (board: Board): Player | 'Draw' | null => {
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]
      }
    }
    if (board.every((cell) => cell !== null)) {
      return 'Draw'
    }
    return null
  }

  const makeAiMove = useCallback((board: Board): number => {
    // Simple AI: Try to win, then block, then take center, then take corner, else random
    const availableMoves = board
      .map((cell, index) => (cell === null ? index : null))
      .filter((index) => index !== null) as number[]

    // Try to win
    for (const move of availableMoves) {
      const testBoard = [...board]
      testBoard[move] = 'O'
      if (checkWinner(testBoard) === 'O') {
        return move
      }
    }

    // Try to block
    for (const move of availableMoves) {
      const testBoard = [...board]
      testBoard[move] = 'X'
      if (checkWinner(testBoard) === 'X') {
        return move
      }
    }

    // Take center
    if (availableMoves.includes(4)) {
      return 4
    }

    // Take corner
    const corners = [0, 2, 6, 8]
    const availableCorners = corners.filter((corner) => availableMoves.includes(corner))
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)]
    }

    // Random move
    return availableMoves[Math.floor(Math.random() * availableMoves.length)]
  }, [])

  const handleCellClick = useCallback((index: number) => {
    if (board[index] || winner) return

    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)

    const gameWinner = checkWinner(newBoard)
    if (gameWinner) {
      setWinner(gameWinner)
      if (gameWinner === 'X') {
        setXScore((prev) => prev + 1)
      } else if (gameWinner === 'O') {
        setOScore((prev) => prev + 1)
      }
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X')
    }
  }, [board, currentPlayer, winner])

  useEffect(() => {
    if (isAiMode && currentPlayer === 'O' && !winner && board) {
      const timer = setTimeout(() => {
        const aiMove = makeAiMove(board)
        if (board[aiMove] === null) {
          const newBoard = [...board]
          newBoard[aiMove] = 'O'
          setBoard(newBoard)

          const gameWinner = checkWinner(newBoard)
          if (gameWinner) {
            setWinner(gameWinner)
            if (gameWinner === 'O') {
              setOScore((prev) => prev + 1)
            }
          } else {
            setCurrentPlayer('X')
          }
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentPlayer, isAiMode, board, winner, makeAiMove])

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer('X')
    setWinner(null)
  }

  const resetScores = () => {
    setXScore(0)
    setOScore(0)
    resetGame()
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="text-white">
            <div className="text-lg font-semibold mb-2">
              Current Player: <span className="text-2xl">{currentPlayer}</span>
            </div>
            {winner && (
              <div className="text-xl font-bold">
                {winner === 'Draw' ? (
                  <span className="text-yellow-400">It's a Draw!</span>
                ) : (
                  <span className="text-green-400">Player {winner} Wins!</span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={resetGame} className="btn-primary text-sm">
              New Game
            </button>
            <button
              onClick={() => {
                setIsAiMode(!isAiMode)
                resetGame()
              }}
              className={`btn-secondary text-sm ${isAiMode ? 'bg-purple-600/30' : ''}`}
            >
              {isAiMode ? 'AI Mode: ON' : 'AI Mode: OFF'}
            </button>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-4 mb-4">
          <div className="flex justify-around text-white">
            <div className="text-center">
              <div className="text-2xl font-bold">X: {xScore}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">O: {oScore}</div>
            </div>
          </div>
          <button onClick={resetScores} className="btn-secondary w-full mt-2 text-sm">
            Reset Scores
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-white/10 p-4 rounded-lg">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            disabled={!!cell || !!winner}
            className={`w-20 h-20 text-4xl font-bold rounded transition-all ${
              cell === 'X'
                ? 'bg-blue-500 text-white'
                : cell === 'O'
                ? 'bg-red-500 text-white'
                : 'bg-white/20 hover:bg-white/30 text-white/50'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  )
}

