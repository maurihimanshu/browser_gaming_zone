import { useState, useEffect, useCallback, useRef } from 'react'
import TetrisSettings from './TetrisSettings'

interface TetrisPiece {
  shape: number[][]
  color: string
}

interface TetrisGameConfig {
  gridWidth: number
  gridHeight: number
  gameSpeed: number
}

const DEFAULT_CONFIG: TetrisGameConfig = {
  gridWidth: 10,
  gridHeight: 20,
  gameSpeed: 1000,
}

// Tetris pieces (Tetrominoes)
const TETRIS_PIECES: TetrisPiece[] = [
  {
    shape: [[1, 1, 1, 1]], // I
    color: 'bg-cyan-500',
  },
  {
    shape: [
      [1, 1],
      [1, 1],
    ], // O
    color: 'bg-yellow-500',
  },
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ], // T
    color: 'bg-purple-500',
  },
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ], // S
    color: 'bg-green-500',
  },
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ], // Z
    color: 'bg-red-500',
  },
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ], // J
    color: 'bg-blue-500',
  },
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ], // L
    color: 'bg-orange-500',
  },
]

export default function TetrisGame() {
  const [config, setConfig] = useState<TetrisGameConfig>(DEFAULT_CONFIG)
  const [showSettings, setShowSettings] = useState(false)
  const [grid, setGrid] = useState<number[][]>([])
  // currentPiece is stored in gameStateRef, no need for separate state
  const [nextPiece, setNextPiece] = useState<TetrisPiece | null>(null)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)

  const gameStateRef = useRef({
    grid: [] as number[][],
    currentPiece: null as { shape: number[][]; x: number; y: number; color: string } | null,
    lastMoveTime: 0,
  })

  const [, forceUpdate] = useState(0)
  const triggerUpdate = () => forceUpdate((prev) => prev + 1)
  const animationFrameRef = useRef<number>()
  const keysRef = useRef<Set<string>>(new Set())
  const lastKeyTimeRef = useRef<{ [key: string]: number }>({})

  const initializeGrid = useCallback(() => {
    return Array(config.gridHeight)
      .fill(null)
      .map(() => Array(config.gridWidth).fill(0))
  }, [config.gridHeight, config.gridWidth])

  const getRandomPiece = useCallback((): TetrisPiece => {
    return TETRIS_PIECES[Math.floor(Math.random() * TETRIS_PIECES.length)]
  }, [])

  const rotatePiece = useCallback((shape: number[][]): number[][] => {
    const rows = shape.length
    const cols = shape[0].length
    const rotated: number[][] = Array(cols)
      .fill(null)
      .map(() => Array(rows).fill(0))

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotated[j][rows - 1 - i] = shape[i][j]
      }
    }

    return rotated
  }, [])

  const isValidPosition = useCallback(
    (piece: { shape: number[][]; x: number; y: number }, gridState: number[][]): boolean => {
      for (let i = 0; i < piece.shape.length; i++) {
        for (let j = 0; j < piece.shape[i].length; j++) {
          if (piece.shape[i][j]) {
            const newX = piece.x + j
            const newY = piece.y + i

            if (
              newX < 0 ||
              newX >= config.gridWidth ||
              newY >= config.gridHeight ||
              (newY >= 0 && gridState[newY][newX] !== 0)
            ) {
              return false
            }
          }
        }
      }
      return true
    },
    [config.gridWidth, config.gridHeight]
  )

  const placePiece = useCallback(
    (piece: { shape: number[][]; x: number; y: number; color: string }, gridState: number[][]) => {
      const newGrid = gridState.map((row) => [...row])
      const colorIndex = TETRIS_PIECES.findIndex((p) => p.color === piece.color) + 1

      for (let i = 0; i < piece.shape.length; i++) {
        for (let j = 0; j < piece.shape[i].length; j++) {
          if (piece.shape[i][j]) {
            const y = piece.y + i
            const x = piece.x + j
            if (y >= 0) {
              newGrid[y][x] = colorIndex
            }
          }
        }
      }

      return newGrid
    },
    []
  )

  const clearLines = useCallback((gridState: number[][]): { newGrid: number[][]; linesCleared: number } => {
    const newGrid: number[][] = []
    let linesCleared = 0

    for (let i = gridState.length - 1; i >= 0; i--) {
      if (gridState[i].every((cell) => cell !== 0)) {
        linesCleared++
      } else {
        newGrid.unshift(gridState[i])
      }
    }

    while (newGrid.length < config.gridHeight) {
      newGrid.unshift(Array(config.gridWidth).fill(0))
    }

    return { newGrid, linesCleared }
  }, [config.gridHeight, config.gridWidth])

  const spawnNewPiece = useCallback(() => {
    const piece = nextPiece || getRandomPiece()
    const newNextPiece = getRandomPiece()
    const startX = Math.floor(config.gridWidth / 2) - Math.floor(piece.shape[0].length / 2)
    const startY = 0

    const newPiece = {
      shape: piece.shape,
      x: startX,
      y: startY,
      color: piece.color,
    }

    if (!isValidPosition(newPiece, gameStateRef.current.grid)) {
      setGameOver(true)
      return null
    }

    setNextPiece(newNextPiece)
    return newPiece
  }, [nextPiece, getRandomPiece, config.gridWidth, isValidPosition])

  const initializeGame = useCallback(() => {
    const newGrid = initializeGrid()
    gameStateRef.current.grid = newGrid
    setGrid(newGrid)
    setScore(0)
    setLines(0)
    setLevel(1)
    setGameOver(false)
    setIsPaused(false)
    setGameStarted(false)
    gameStateRef.current.currentPiece = null
    gameStateRef.current.lastMoveTime = 0

    const firstPiece = getRandomPiece()
    setNextPiece(firstPiece)
    gameStateRef.current.currentPiece = null
  }, [initializeGrid, getRandomPiece])

  useEffect(() => {
    initializeGame()
  }, [initializeGame, config.gridWidth, config.gridHeight])

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault()
      }

      if (gameOver || !gameStarted || isPaused) {
        if (e.key === ' ') {
          if (!gameStarted) {
            setGameStarted(true)
            setIsPaused(false)
            const newPiece = spawnNewPiece()
            if (newPiece) {
              gameStateRef.current.currentPiece = newPiece
              triggerUpdate()
            }
          } else {
            setIsPaused((prev) => !prev)
          }
        }
        return
      }

      const now = Date.now()
      const key = e.key.toLowerCase()
      const lastTime = lastKeyTimeRef.current[key] || 0

      if (now - lastTime < 50) return // Debounce
      lastKeyTimeRef.current[key] = now

      keysRef.current.add(e.key)
    },
    [gameOver, gameStarted, isPaused, spawnNewPiece]
  )

  const handleKeyRelease = useCallback((e: KeyboardEvent) => {
    keysRef.current.delete(e.key)
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    window.addEventListener('keyup', handleKeyRelease)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
      window.removeEventListener('keyup', handleKeyRelease)
    }
  }, [handleKeyPress, handleKeyRelease])

  // Game loop
  useEffect(() => {
    if (!gameStarted || isPaused || gameOver) return

    const gameLoop = (currentTime: number) => {
      const state = gameStateRef.current
      const speed = Math.max(50, config.gameSpeed - (level - 1) * 50)

      if (currentTime - state.lastMoveTime >= speed) {
        // Move piece down
        if (state.currentPiece) {
          const movedPiece = {
            ...state.currentPiece,
            y: state.currentPiece.y + 1,
          }

          if (isValidPosition(movedPiece, state.grid)) {
            state.currentPiece = movedPiece
            triggerUpdate()
          } else {
            // Place piece
            const newGrid = placePiece(state.currentPiece, state.grid)
            const { newGrid: clearedGrid, linesCleared } = clearLines(newGrid)
            state.grid = clearedGrid
            setGrid(clearedGrid)

            if (linesCleared > 0) {
              const points = [0, 100, 300, 500, 800][linesCleared] * level
              setScore((prev) => prev + points)
              setLines((prev) => {
                const newLines = prev + linesCleared
                const newLevel = Math.floor(newLines / 10) + 1
                setLevel(newLevel)
                return newLines
              })
            }

            // Spawn new piece
            const newPiece = spawnNewPiece()
            if (newPiece) {
              state.currentPiece = newPiece
              triggerUpdate()
            } else {
              setGameOver(true)
            }
          }
        } else {
          const newPiece = spawnNewPiece()
          if (newPiece) {
            state.currentPiece = newPiece
            triggerUpdate()
          }
        }

        state.lastMoveTime = currentTime
        triggerUpdate()
      }

      // Handle continuous key presses
      const now = Date.now()
      if (keysRef.current.has('ArrowLeft') || keysRef.current.has('a') || keysRef.current.has('A')) {
        if (state.currentPiece && (now - (lastKeyTimeRef.current['arrowleft'] || 0) > 100)) {
          const movedPiece = { ...state.currentPiece, x: state.currentPiece.x - 1 }
          if (isValidPosition(movedPiece, state.grid)) {
            state.currentPiece = movedPiece
            triggerUpdate()
            lastKeyTimeRef.current['arrowleft'] = now
          }
        }
      }
      if (keysRef.current.has('ArrowRight') || keysRef.current.has('d') || keysRef.current.has('D')) {
        if (state.currentPiece && (now - (lastKeyTimeRef.current['arrowright'] || 0) > 100)) {
          const movedPiece = { ...state.currentPiece, x: state.currentPiece.x + 1 }
          if (isValidPosition(movedPiece, state.grid)) {
            state.currentPiece = movedPiece
            triggerUpdate()
            lastKeyTimeRef.current['arrowright'] = now
          }
        }
      }
      if (keysRef.current.has('ArrowDown') || keysRef.current.has('s') || keysRef.current.has('S')) {
        if (state.currentPiece && (now - (lastKeyTimeRef.current['arrowdown'] || 0) > 50)) {
          const movedPiece = { ...state.currentPiece, y: state.currentPiece.y + 1 }
          if (isValidPosition(movedPiece, state.grid)) {
            state.currentPiece = movedPiece
            triggerUpdate()
            lastKeyTimeRef.current['arrowdown'] = now
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    gameStateRef.current.lastMoveTime = performance.now()
    animationFrameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameStarted, isPaused, gameOver, config, level, isValidPosition, placePiece, clearLines, spawnNewPiece])

  // Handle rotation
  useEffect(() => {
    if (!gameStarted || isPaused || gameOver) return

    const handleRotation = () => {
      const state = gameStateRef.current
        if (state.currentPiece) {
          const rotatedShape = rotatePiece(state.currentPiece.shape)
          const rotatedPiece = {
            ...state.currentPiece,
            shape: rotatedShape,
          }

          if (isValidPosition(rotatedPiece, state.grid)) {
            state.currentPiece = rotatedPiece
            triggerUpdate()
          }
        }
    }

    const checkRotation = () => {
      if (keysRef.current.has('ArrowUp') || keysRef.current.has('w') || keysRef.current.has('W')) {
        handleRotation()
        keysRef.current.delete('ArrowUp')
        keysRef.current.delete('w')
        keysRef.current.delete('W')
      }
    }

    const interval = setInterval(checkRotation, 100)
    return () => clearInterval(interval)
  }, [gameStarted, isPaused, gameOver, rotatePiece, isValidPosition])

  // Touch controls for mobile
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current || !gameStarted || isPaused || gameOver) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      const minSwipeDistance = 30

      const state = gameStateRef.current

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance && state.currentPiece) {
          const movedPiece = {
            ...state.currentPiece,
            x: state.currentPiece.x + (deltaX > 0 ? 1 : -1),
          }
          if (isValidPosition(movedPiece, state.grid)) {
            state.currentPiece = movedPiece
            triggerUpdate()
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0) {
            // Swipe down - hard drop or move down
            if (state.currentPiece) {
              let movedPiece = { ...state.currentPiece, y: state.currentPiece.y + 1 }
              while (isValidPosition(movedPiece, state.grid)) {
                state.currentPiece = movedPiece
                movedPiece = { ...movedPiece, y: movedPiece.y + 1 }
              }
              triggerUpdate()
            }
          } else {
            // Swipe up - rotate
            if (state.currentPiece) {
              const rotatedShape = rotatePiece(state.currentPiece.shape)
              const rotatedPiece = {
                ...state.currentPiece,
                shape: rotatedShape,
              }
              if (isValidPosition(rotatedPiece, state.grid)) {
                state.currentPiece = rotatedPiece
                triggerUpdate()
              }
            }
          }
        } else {
          // Tap - rotate
          if (state.currentPiece) {
            const rotatedShape = rotatePiece(state.currentPiece.shape)
            const rotatedPiece = {
              ...state.currentPiece,
              shape: rotatedShape,
            }
            if (isValidPosition(rotatedPiece, state.grid)) {
              state.currentPiece = rotatedPiece
              triggerUpdate()
            }
          }
        }
      }

      touchStartRef.current = null
    },
    [gameStarted, isPaused, gameOver, isValidPosition, rotatePiece]
  )

  const resetGame = () => {
    initializeGame()
  }

  const handleConfigChange = (newConfig: TetrisGameConfig) => {
    setConfig(newConfig)
    initializeGame()
  }

  const renderGrid = () => {
    const displayGrid = grid.map((row) => [...row])
    const state = gameStateRef.current

    if (state.currentPiece) {
      for (let i = 0; i < state.currentPiece.shape.length; i++) {
        for (let j = 0; j < state.currentPiece.shape[i].length; j++) {
          if (state.currentPiece.shape[i][j]) {
            const y = state.currentPiece.y + i
            const x = state.currentPiece.x + j
            if (y >= 0 && y < config.gridHeight && x >= 0 && x < config.gridWidth) {
              const colorIndex = TETRIS_PIECES.findIndex((p) => p.color === state.currentPiece!.color) + 1
              displayGrid[y][x] = colorIndex
            }
          }
        }
      }
    }

    return displayGrid
  }

  const cellSize = Math.min(25, 400 / config.gridHeight)

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
            <TetrisSettings config={config} onConfigChange={handleConfigChange} />
          </div>
        )}
      </div>

      {/* Game Info */}
      <div className="mb-4 flex items-center justify-between w-full max-w-2xl">
        <div className="text-white">
          <div className="text-2xl font-bold">Score: {score}</div>
          <div className="text-lg">Lines: {lines} | Level: {level}</div>
          {gameOver && <div className="text-red-400 font-semibold">Game Over!</div>}
          {isPaused && !gameOver && <div className="text-yellow-400 font-semibold">Paused</div>}
          {!gameStarted && !gameOver && (
            <div className="text-white/60 text-sm mt-1">Press SPACE to start</div>
          )}
        </div>
        <button onClick={resetGame} className="btn-primary">
          {gameOver ? 'Play Again' : 'Reset'}
        </button>
      </div>

      {/* Game Area */}
      <div className="flex gap-6 items-start">
        {/* Main Grid */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="bg-black rounded-lg border-4 border-white/20 p-2 touch-none select-none"
        >
          <div
            className="grid gap-0"
            style={{
              gridTemplateColumns: `repeat(${config.gridWidth}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${config.gridHeight}, ${cellSize}px)`,
            }}
          >
            {renderGrid().map((row, i) =>
              row.map((cell, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`border border-gray-800 ${
                    cell === 0 ? 'bg-gray-900' : TETRIS_PIECES[cell - 1]?.color || 'bg-gray-700'
                  }`}
                  style={{ width: cellSize, height: cellSize }}
                />
              ))
            )}
          </div>
        </div>

        {/* Next Piece Preview */}
        {nextPiece && (
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="text-white text-sm mb-2 font-semibold">Next:</div>
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${nextPiece.shape[0].length}, 20px)` }}>
              {nextPiece.shape.map((row, i) =>
                row.map((cell, j) => (
                  <div
                    key={`next-${i}-${j}`}
                    className={`${cell ? nextPiece.color : 'bg-transparent'} border border-gray-700`}
                    style={{ width: 20, height: 20 }}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-white/60 text-sm text-center max-w-2xl">
        <p>Arrow Keys: Move/Rotate | Space: Pause | Swipe/Tap on mobile</p>
      </div>
    </div>
  )
}

