import { useState, useEffect, useCallback, useRef } from 'react'
import MinesweeperSettings from './MinesweeperSettings'

interface Cell {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  adjacentMines: number
}

interface MinesweeperGameConfig {
  gridSize: 'beginner' | 'intermediate' | 'expert' | 'custom'
  customWidth: number
  customHeight: number
  customMines: number
}

const DEFAULT_CONFIG: MinesweeperGameConfig = {
  gridSize: 'beginner',
  customWidth: 10,
  customHeight: 10,
  customMines: 10,
}

const PRESETS = {
  beginner: { width: 9, height: 9, mines: 10 },
  intermediate: { width: 16, height: 16, mines: 40 },
  expert: { width: 30, height: 16, mines: 99 },
}

export default function MinesweeperGame() {
  const [config, setConfig] = useState<MinesweeperGameConfig>(DEFAULT_CONFIG)
  const [showSettings, setShowSettings] = useState(false)
  const [grid, setGrid] = useState<Cell[][]>([])
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [timer, setTimer] = useState(0)
  const [minesRemaining, setMinesRemaining] = useState(0)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)

  const getGridConfig = useCallback(() => {
    if (config.gridSize === 'custom') {
      return {
        width: config.customWidth,
        height: config.customHeight,
        mines: config.customMines,
      }
    }
    return PRESETS[config.gridSize]
  }, [config])

  const initializeGrid = useCallback((width: number, height: number, mineCount: number, firstClick?: { x: number; y: number }) => {
    const newGrid: Cell[][] = Array(height)
      .fill(null)
      .map(() =>
        Array(width)
          .fill(null)
          .map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
          }))
      )

    // Place mines
    let minesPlaced = 0
    while (minesPlaced < mineCount) {
      const x = Math.floor(Math.random() * width)
      const y = Math.floor(Math.random() * height)

      // Don't place mine on first click
      if (firstClick && x === firstClick.x && y === firstClick.y) continue

      if (!newGrid[y][x].isMine) {
        newGrid[y][x].isMine = true
        minesPlaced++

        // Update adjacent cells
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue
            const ny = y + dy
            const nx = x + dx
            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
              newGrid[ny][nx].adjacentMines++
            }
          }
        }
      }
    }

    return newGrid
  }, [])

  const revealCell = useCallback((x: number, y: number, gridState: Cell[][]) => {
    const newGrid = gridState.map((row) => row.map((cell) => ({ ...cell })))
    const cell = newGrid[y][x]

    if (cell.isRevealed || cell.isFlagged) return newGrid

    cell.isRevealed = true

    if (cell.isMine) {
      // Reveal all mines
      for (let i = 0; i < newGrid.length; i++) {
        for (let j = 0; j < newGrid[i].length; j++) {
          if (newGrid[i][j].isMine) {
            newGrid[i][j].isRevealed = true
          }
        }
      }
      return newGrid
    }

    // Auto-reveal adjacent cells if no adjacent mines
    if (cell.adjacentMines === 0) {
      const width = newGrid[0].length
      const height = newGrid.length

      const revealAdjacent = (cx: number, cy: number) => {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue
            const ny = cy + dy
            const nx = cx + dx
            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
              const adjCell = newGrid[ny][nx]
              if (!adjCell.isRevealed && !adjCell.isFlagged) {
                adjCell.isRevealed = true
                if (adjCell.adjacentMines === 0) {
                  revealAdjacent(nx, ny)
                }
              }
            }
          }
        }
      }

      revealAdjacent(x, y)
    }

    return newGrid
  }, [])

  const checkWin = useCallback((gridState: Cell[][]) => {
    const { width, height, mines } = getGridConfig()
    let revealedCount = 0

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (gridState[i][j].isRevealed) {
          revealedCount++
        }
      }
    }

    return revealedCount === width * height - mines
  }, [getGridConfig])

  const handleCellClick = useCallback(
    (x: number, y: number, rightClick: boolean = false) => {
      if (gameOver || gameWon) return

      if (!gameStarted) {
        setGameStarted(true)
        startTimeRef.current = Date.now()
        const gridConfig = getGridConfig()
        const newGrid = initializeGrid(gridConfig.width, gridConfig.height, gridConfig.mines, { x, y })
        setGrid(newGrid)
        setMinesRemaining(gridConfig.mines)

        // Start timer
        timerRef.current = setInterval(() => {
          setTimer(Math.floor((Date.now() - startTimeRef.current) / 1000))
        }, 1000)

        // Handle the click
        if (!rightClick) {
          const updatedGrid = revealCell(x, y, newGrid)
          setGrid(updatedGrid)
          if (updatedGrid[y][x].isMine) {
            setGameOver(true)
            if (timerRef.current) {
              clearInterval(timerRef.current)
            }
          } else if (checkWin(updatedGrid)) {
            setGameWon(true)
            if (timerRef.current) {
              clearInterval(timerRef.current)
            }
          }
        }
        return
      }

      if (rightClick) {
        // Toggle flag
        setGrid((prevGrid) => {
          const newGrid = prevGrid.map((row) => row.map((cell) => ({ ...cell })))
          const cell = newGrid[y][x]

          if (cell.isRevealed) return newGrid

          cell.isFlagged = !cell.isFlagged
          setMinesRemaining((prev) => (cell.isFlagged ? prev - 1 : prev + 1))
          return newGrid
        })
        return
      }

      // Left click - reveal cell
      setGrid((prevGrid) => {
        const newGrid = revealCell(x, y, prevGrid)
        const cell = newGrid[y][x]

        if (cell.isMine) {
          setGameOver(true)
          if (timerRef.current) {
            clearInterval(timerRef.current)
          }
        } else if (checkWin(newGrid)) {
          setGameWon(true)
          if (timerRef.current) {
            clearInterval(timerRef.current)
          }
        }

        return newGrid
      })
    },
    [gameOver, gameWon, gameStarted, revealCell, checkWin, initializeGrid, getGridConfig]
  )

  const resetGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    const gridConfig = getGridConfig()
    const newGrid = initializeGrid(gridConfig.width, gridConfig.height, gridConfig.mines)
    setGrid(newGrid)
    setGameOver(false)
    setGameWon(false)
    setGameStarted(false)
    setTimer(0)
    setMinesRemaining(gridConfig.mines)
    startTimeRef.current = 0
  }, [initializeGrid, getGridConfig])

  useEffect(() => {
    resetGame()
  }, [resetGame, config.gridSize, config.customWidth, config.customHeight, config.customMines])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const handleConfigChange = (newConfig: MinesweeperGameConfig) => {
    setConfig(newConfig)
    resetGame()
  }

  const gridConfig = getGridConfig()
  const cellSize = Math.min(30, 600 / Math.max(gridConfig.width, gridConfig.height))

  const getCellColor = (adjacentMines: number): string => {
    const colors: Record<number, string> = {
      1: 'text-blue-400',
      2: 'text-green-400',
      3: 'text-red-400',
      4: 'text-purple-400',
      5: 'text-yellow-400',
      6: 'text-pink-400',
      7: 'text-gray-400',
      8: 'text-orange-400',
    }
    return colors[adjacentMines] || 'text-white'
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
            <MinesweeperSettings config={config} onConfigChange={handleConfigChange} />
          </div>
        )}
      </div>

      {/* Game Info */}
      <div className="mb-4 flex items-center justify-between w-full max-w-2xl">
        <div className="text-white">
          <div className="text-lg font-semibold">
            Mines: {minesRemaining} | Time: {timer}s
          </div>
          {gameOver && <div className="text-red-400 font-semibold">Game Over!</div>}
          {gameWon && <div className="text-green-400 font-semibold">🎉 You Won!</div>}
        </div>
        <button onClick={resetGame} className="btn-primary">
          Reset
        </button>
      </div>

      {/* Game Grid */}
      <div
        className="bg-white/10 rounded-lg p-4 border border-white/20 touch-none select-none"
        style={{ maxWidth: '100%', overflow: 'auto' }}
      >
        <div
          className="grid gap-1 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${gridConfig.width}, ${cellSize}px)`,
          }}
        >
          {grid.map((row, y) =>
            row.map((cell, x) => (
              <button
                key={`${y}-${x}`}
                onClick={() => handleCellClick(x, y, false)}
                onContextMenu={(e) => {
                  e.preventDefault()
                  handleCellClick(x, y, true)
                }}
                disabled={gameOver || gameWon}
                className={`
                  ${cellSize}px h-${cellSize}px flex items-center justify-center font-bold text-sm
                  transition-all duration-150
                  ${
                    cell.isRevealed
                      ? cell.isMine
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                      : cell.isFlagged
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-500 hover:bg-gray-400 text-white'
                  }
                  disabled:cursor-not-allowed
                `}
                style={{ width: cellSize, height: cellSize }}
              >
                {cell.isFlagged ? '🚩' : cell.isRevealed && cell.isMine ? '💣' : cell.isRevealed && cell.adjacentMines > 0 ? (
                  <span className={getCellColor(cell.adjacentMines)}>{cell.adjacentMines}</span>
                ) : null}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-white/60 text-sm text-center max-w-2xl">
        <p>Left click to reveal | Right click to flag | First click is always safe!</p>
      </div>
    </div>
  )
}

