import { useState, useEffect, useCallback, useRef } from 'react'
import ConnectFourSettings from './ConnectFourSettings'

type Player = 1 | 2 | null
type Board = Player[][]

interface ConnectFourGameConfig {
  aiDifficulty: 'easy' | 'medium' | 'hard'
  aiEnabled: boolean
}

const DEFAULT_CONFIG: ConnectFourGameConfig = {
  aiDifficulty: 'medium',
  aiEnabled: true,
}

const ROWS = 6
const COLS = 7
const WIN_LENGTH = 4

export default function ConnectFourGame() {
  const [config, setConfig] = useState<ConnectFourGameConfig>(DEFAULT_CONFIG)
  const [showSettings, setShowSettings] = useState(false)
  const [board, setBoard] = useState<Board>([])
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1)
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null)
  const [player1Score, setPlayer1Score] = useState(0)
  const [player2Score, setPlayer2Score] = useState(0)
  const [isAiThinking, setIsAiThinking] = useState(false)

  const boardRef = useRef<Board>([])
  const currentPlayerRef = useRef<Player>(1)
  const winnerRef = useRef<Player | 'Draw' | null>(null)
  const isAiThinkingRef = useRef(false)

  const initializeBoard = useCallback((): Board => {
    return Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(null))
  }, [])

  useEffect(() => {
    const newBoard = initializeBoard()
    setBoard(newBoard)
    boardRef.current = newBoard
    setCurrentPlayer(1)
    currentPlayerRef.current = 1
    setWinner(null)
    winnerRef.current = null
    setIsAiThinking(false)
    isAiThinkingRef.current = false
  }, [initializeBoard])

  useEffect(() => {
    boardRef.current = board
  }, [board])

  useEffect(() => {
    currentPlayerRef.current = currentPlayer
  }, [currentPlayer])

  useEffect(() => {
    winnerRef.current = winner
  }, [winner])

  useEffect(() => {
    isAiThinkingRef.current = isAiThinking
  }, [isAiThinking])

  const checkWinner = useCallback((boardState: Board, row: number, col: number, player: Player): boolean => {
    if (!player) return false

    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonal /
      [1, -1], // diagonal \
    ]

    for (const [dx, dy] of directions) {
      let count = 1

      // Check positive direction
      for (let i = 1; i < WIN_LENGTH; i++) {
        const newRow = row + dx * i
        const newCol = col + dy * i
        if (
          newRow >= 0 &&
          newRow < ROWS &&
          newCol >= 0 &&
          newCol < COLS &&
          boardState[newRow][newCol] === player
        ) {
          count++
        } else {
          break
        }
      }

      // Check negative direction
      for (let i = 1; i < WIN_LENGTH; i++) {
        const newRow = row - dx * i
        const newCol = col - dy * i
        if (
          newRow >= 0 &&
          newRow < ROWS &&
          newCol >= 0 &&
          newCol < COLS &&
          boardState[newRow][newCol] === player
        ) {
          count++
        } else {
          break
        }
      }

      if (count >= WIN_LENGTH) {
        return true
      }
    }

    return false
  }, [])

  const getAvailableRow = useCallback((col: number, boardState: Board): number | null => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (boardState[row][col] === null) {
        return row
      }
    }
    return null
  }, [])

  const makeMove = useCallback(
    (col: number, player: Player, boardState: Board): { newBoard: Board; won: boolean } | null => {
      const row = getAvailableRow(col, boardState)
      if (row === null) return null

      const newBoard = boardState.map((r) => [...r])
      newBoard[row][col] = player

      const won = checkWinner(newBoard, row, col, player)
      return {
        newBoard,
        won,
      }
    },
    [getAvailableRow, checkWinner]
  )

  const checkDraw = useCallback((boardState: Board): boolean => {
    // Check if top row is full (all columns are filled)
    return boardState[0].every((cell) => cell !== null)
  }, [])

  const handleColumnClick = useCallback(
    (col: number) => {
      if (winner || isAiThinking) return

      const player = currentPlayer
      if (!player) return

      // In two-player mode, allow both players to click
      // In AI mode, only allow player 1 to click
      if (config.aiEnabled && player !== 1) return

      setBoard((prevBoard) => {
        const result = makeMove(col, player, prevBoard)
        if (!result) return prevBoard

        // Update refs immediately
        boardRef.current = result.newBoard

        if (result.won) {
          setWinner(player)
          winnerRef.current = player
          if (player === 1) {
            setPlayer1Score((prev) => prev + 1)
          } else {
            setPlayer2Score((prev) => prev + 1)
          }
        } else if (checkDraw(result.newBoard)) {
          setWinner('Draw')
          winnerRef.current = 'Draw'
        } else {
          const nextPlayer = player === 1 ? 2 : 1
          setCurrentPlayer(nextPlayer)
          currentPlayerRef.current = nextPlayer
        }

        return result.newBoard
      })
    },
    [config.aiEnabled, isAiThinking, makeMove, checkDraw, currentPlayer, winner]
  )

  const evaluateBoard = useCallback((boardState: Board, player: Player): number => {
    let score = 0

    // Check for immediate wins/losses
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (checkWinner(boardState, row, col, player)) {
          return 10000
        }
        if (checkWinner(boardState, row, col, player === 1 ? 2 : 1)) {
          return -10000
        }
      }
    }

    // Evaluate potential lines
    const evaluateLine = (cells: Player[]): number => {
      const playerCount = cells.filter((c) => c === player).length
      const opponentCount = cells.filter((c) => c === (player === 1 ? 2 : 1)).length
      const emptyCount = cells.filter((c) => c === null).length

      if (playerCount === 3 && emptyCount === 1) return 100
      if (opponentCount === 3 && emptyCount === 1) return -100
      if (playerCount === 2 && emptyCount === 2) return 10
      if (opponentCount === 2 && emptyCount === 2) return -10
      if (playerCount === 1 && emptyCount === 3) return 1
      if (opponentCount === 1 && emptyCount === 3) return -1

      return 0
    }

    // Check horizontal lines
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col <= COLS - WIN_LENGTH; col++) {
        const line = boardState[row].slice(col, col + WIN_LENGTH)
        score += evaluateLine(line)
      }
    }

    // Check vertical lines
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row <= ROWS - WIN_LENGTH; row++) {
        const line = Array(WIN_LENGTH)
          .fill(null)
          .map((_, i) => boardState[row + i][col])
        score += evaluateLine(line)
      }
    }

    // Check diagonal lines
    for (let row = 0; row <= ROWS - WIN_LENGTH; row++) {
      for (let col = 0; col <= COLS - WIN_LENGTH; col++) {
        const line1 = Array(WIN_LENGTH)
          .fill(null)
          .map((_, i) => boardState[row + i][col + i])
        score += evaluateLine(line1)

        const line2 = Array(WIN_LENGTH)
          .fill(null)
          .map((_, i) => boardState[row + i][col + WIN_LENGTH - 1 - i])
        score += evaluateLine(line2)
      }
    }

    // Center column preference
    for (let row = 0; row < ROWS; row++) {
      if (boardState[row][Math.floor(COLS / 2)] === player) {
        score += 3
      }
    }

    return score
  }, [checkWinner])

  const minimax = useCallback(
    (boardState: Board, depth: number, alpha: number, beta: number, maximizing: boolean): number => {
      // Check for terminal states
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          if (checkWinner(boardState, row, col, 2)) {
            return 10000 - depth
          }
          if (checkWinner(boardState, row, col, 1)) {
            return -10000 + depth
          }
        }
      }

      if (checkDraw(boardState)) {
        return 0
      }

      if (depth === 0) {
        return evaluateBoard(boardState, 2)
      }

      if (maximizing) {
        let maxEval = -Infinity
        for (let col = 0; col < COLS; col++) {
          const result = makeMove(col, 2, boardState)
          if (result) {
            const evalScore = minimax(result.newBoard, depth - 1, alpha, beta, false)
            maxEval = Math.max(maxEval, evalScore)
            alpha = Math.max(alpha, evalScore)
            if (beta <= alpha) break
          }
        }
        return maxEval
      } else {
        let minEval = Infinity
        for (let col = 0; col < COLS; col++) {
          const result = makeMove(col, 1, boardState)
          if (result) {
            const evalScore = minimax(result.newBoard, depth - 1, alpha, beta, true)
            minEval = Math.min(minEval, evalScore)
            beta = Math.min(beta, evalScore)
            if (beta <= alpha) break
          }
        }
        return minEval
      }
    },
    [checkWinner, makeMove, evaluateBoard, checkDraw]
  )

  const getAiMove = useCallback(
    (boardState: Board): number => {
      const difficultyDepths: Record<string, number> = {
        easy: 2,
        medium: 4,
        hard: 6,
      }

      const depth = difficultyDepths[config.aiDifficulty] || 4
      let bestMove = Math.floor(COLS / 2)
      let bestScore = -Infinity
      let hasValidMove = false

      // Try each column
      for (let col = 0; col < COLS; col++) {
        const result = makeMove(col, 2, boardState)
        if (result) {
          hasValidMove = true
          const score = minimax(result.newBoard, depth, -Infinity, Infinity, false)
          if (score > bestScore) {
            bestScore = score
            bestMove = col
          }
        }
      }

      // Fallback: if no valid move found, try center or first available
      if (!hasValidMove) {
        for (let col = 0; col < COLS; col++) {
          if (getAvailableRow(col, boardState) !== null) {
            return col
          }
        }
      }

      return bestMove
    },
    [config.aiDifficulty, makeMove, minimax, getAvailableRow]
  )

  // AI move effect
  useEffect(() => {
    // Only trigger AI if it's player 2's turn, AI is enabled, game is not over, and AI is not already thinking
    if (!config.aiEnabled || currentPlayer !== 2 || winner || isAiThinkingRef.current) {
      return
    }

    setIsAiThinking(true)
    isAiThinkingRef.current = true
    
    const timer = setTimeout(() => {
      try {
        // Get the latest board state from ref (to avoid stale closure)
        const currentBoard = boardRef.current
        
        // Double-check conditions before making move (use refs for latest values)
        if (currentPlayerRef.current === 2 && !winnerRef.current && config.aiEnabled) {
          const aiCol = getAiMove(currentBoard)
          const result = makeMove(aiCol, 2, currentBoard)

          if (result) {
            // Update board and ref
            boardRef.current = result.newBoard
            setBoard(result.newBoard)

            if (result.won) {
              winnerRef.current = 2
              setWinner(2)
              setPlayer2Score((prev) => prev + 1)
            } else if (checkDraw(result.newBoard)) {
              winnerRef.current = 'Draw'
              setWinner('Draw')
            } else {
              currentPlayerRef.current = 1
              setCurrentPlayer(1)
            }
          } else {
            // If no valid move, it's a draw
            setWinner('Draw')
            winnerRef.current = 'Draw'
          }
        }
      } catch (error) {
        console.error('AI move error:', error)
        // Fallback: try center column or first available
        const currentBoard = boardRef.current
        let moved = false
        for (let col = 0; col < COLS; col++) {
          const result = makeMove(col, 2, currentBoard)
          if (result) {
            boardRef.current = result.newBoard
            setBoard(result.newBoard)
            if (!result.won && !checkDraw(result.newBoard)) {
              currentPlayerRef.current = 1
              setCurrentPlayer(1)
            }
            moved = true
            break
          }
        }
        if (!moved) {
          setWinner('Draw')
          winnerRef.current = 'Draw'
        }
      } finally {
        setIsAiThinking(false)
        isAiThinkingRef.current = false
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [currentPlayer, config.aiEnabled, winner, getAiMove, makeMove, checkDraw])

  const resetGame = () => {
    const newBoard = initializeBoard()
    setBoard(newBoard)
    boardRef.current = newBoard
    setCurrentPlayer(1)
    currentPlayerRef.current = 1
    setWinner(null)
    winnerRef.current = null
    setIsAiThinking(false)
  }

  const resetScores = () => {
    setPlayer1Score(0)
    setPlayer2Score(0)
    resetGame()
  }

  const handleConfigChange = (newConfig: ConnectFourGameConfig) => {
    setConfig(newConfig)
    resetGame()
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Settings Panel */}
      <div className="w-full max-w-2xl mb-6">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="btn-secondary mb-4 flex items-center gap-2"
        >
          <span>⚙️</span>
          <span>{showSettings ? 'Hide' : 'Show'} Settings</span>
        </button>

        {showSettings && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Game Settings</h3>
            <ConnectFourSettings config={config} onConfigChange={handleConfigChange} />
          </div>
        )}
      </div>

      {/* Game Info */}
      <div className="mb-4 flex items-center justify-between w-full max-w-2xl">
        <div className="text-white">
          <div className="text-lg font-semibold mb-2">
            Current Player: <span className="text-2xl">{currentPlayer === 1 ? '🔴' : '🟡'}</span>
            {isAiThinking && currentPlayer === 2 && <span className="text-sm ml-2">(AI thinking...)</span>}
          </div>
          {winner && (
            <div className="text-xl font-bold">
              {winner === 'Draw' ? (
                <span className="text-yellow-400">It's a Draw!</span>
              ) : (
                <span className="text-green-400">Player {winner === 1 ? '🔴' : '🟡'} Wins!</span>
              )}
            </div>
          )}
          <div className="flex gap-4 mt-2">
            <div className="text-sm">
              🔴 Player 1: {player1Score}
            </div>
            <div className="text-sm">
              🟡 {config.aiEnabled ? 'AI' : 'Player 2'}: {player2Score}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={resetGame} className="btn-primary text-sm">
            New Game
          </button>
          <button onClick={resetScores} className="btn-secondary text-sm">
            Reset Scores
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div className="bg-white/10 rounded-lg p-4 border border-white/20">
        <div className="grid grid-cols-7 gap-2">
          {Array(COLS)
            .fill(null)
            .map((_, col) => (
              <div key={col} className="flex flex-col">
                <button
                  onClick={() => handleColumnClick(col)}
                  disabled={winner !== null || isAiThinking || (config.aiEnabled && currentPlayer !== 1)}
                  className="mb-2 w-12 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed rounded text-white font-bold transition-colors"
                >
                  ↓
                </button>
                <div className="grid grid-cols-1 gap-1">
                  {Array(ROWS)
                    .fill(null)
                    .map((_, row) => (
                      <div
                        key={`${row}-${col}`}
                        className={`
                          w-12 h-12 rounded-full border-2 border-gray-600 flex items-center justify-center
                          ${board[row]?.[col] === 1
                            ? 'bg-red-500 border-red-600'
                            : board[row]?.[col] === 2
                            ? 'bg-yellow-500 border-yellow-600'
                            : 'bg-gray-800 border-gray-700'
                          }
                          transition-all duration-200
                        `}
                      />
                    ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-white/60 text-sm text-center max-w-2xl">
        <p>Click a column to drop your piece. Connect 4 in a row to win!</p>
        {!config.aiEnabled && <p className="mt-1">Two-player mode: Take turns clicking columns.</p>}
      </div>
    </div>
  )
}
