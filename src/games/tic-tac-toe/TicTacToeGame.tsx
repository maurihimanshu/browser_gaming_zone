import { useState, useEffect, useCallback, useMemo } from 'react'

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
  const [isAiMode, setIsAiMode] = useState(false)
  const [xScore, setXScore] = useState(0)
  const [oScore, setOScore] = useState(0)

  const checkWinner = useCallback((boardState: Board): { winner: Player | 'Draw' | null; winningCells: number[] } => {
    // Check for winner
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        return { winner: boardState[a], winningCells: combination }
      }
    }
    
    // Check for draw
    if (boardState.every((cell) => cell !== null)) {
      return { winner: 'Draw', winningCells: [] }
    }
    
    return { winner: null, winningCells: [] }
  }, [])

  const gameResult = useMemo(() => checkWinner(board), [board, checkWinner])
  const winner = gameResult.winner
  const winningCells = gameResult.winningCells

  const makeAiMove = useCallback((boardState: Board): number => {
    // Simple AI: Try to win, then block, then take center, then take corner, else random
    const availableMoves = boardState
      .map((cell, index) => (cell === null ? index : null))
      .filter((index) => index !== null) as number[]

    // Try to win
    for (const move of availableMoves) {
      const testBoard = [...boardState]
      testBoard[move] = 'O'
      if (checkWinner(testBoard).winner === 'O') {
        return move
      }
    }

    // Try to block
    for (const move of availableMoves) {
      const testBoard = [...boardState]
      testBoard[move] = 'X'
      if (checkWinner(testBoard).winner === 'X') {
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
  }, [checkWinner])

  const handleCellClick = useCallback((index: number) => {
    if (board[index] || winner) return

    setBoard((prevBoard) => {
      const newBoard = [...prevBoard]
      newBoard[index] = currentPlayer
      
      const gameResult = checkWinner(newBoard)
      if (gameResult.winner) {
        if (gameResult.winner === 'X') {
          setXScore((prev) => prev + 1)
        } else if (gameResult.winner === 'O') {
          setOScore((prev) => prev + 1)
        }
      } else {
        setCurrentPlayer((prev) => (prev === 'X' ? 'O' : 'X'))
      }
      
      return newBoard
    })
  }, [board, currentPlayer, winner, checkWinner])

  useEffect(() => {
    if (isAiMode && currentPlayer === 'O' && !winner) {
      const timer = setTimeout(() => {
        setBoard((prevBoard) => {
          const gameResult = checkWinner(prevBoard)
          // Only make move if game is still ongoing and it's AI's turn
          if (gameResult.winner || currentPlayer !== 'O') {
            return prevBoard
          }
          
          const aiMove = makeAiMove(prevBoard)
          if (prevBoard[aiMove] === null) {
            const newBoard = [...prevBoard]
            newBoard[aiMove] = 'O'
            
            const newGameResult = checkWinner(newBoard)
            if (newGameResult.winner) {
              if (newGameResult.winner === 'O') {
                setOScore((prev) => prev + 1)
              }
            } else {
              setCurrentPlayer('X')
            }
            
            return newBoard
          }
          return prevBoard
        })
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentPlayer, isAiMode, winner, makeAiMove, checkWinner])

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer('X')
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
        {board.map((cell, index) => {
          const isWinningCell = winningCells.includes(index)
          return (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={!!cell || !!winner}
              className={`
                w-20 h-20 text-4xl font-bold rounded transition-all duration-200
                ${cell === 'X'
                  ? 'bg-blue-500 text-white'
                  : cell === 'O'
                  ? 'bg-red-500 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white/50'
                }
                ${isWinningCell ? 'ring-4 ring-yellow-400 ring-offset-2 scale-110' : ''}
                disabled:cursor-not-allowed disabled:opacity-50
              `}
            >
              {cell}
            </button>
          )
        })}
      </div>
    </div>
  )
}
