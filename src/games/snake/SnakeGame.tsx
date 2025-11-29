import { useState, useEffect, useCallback, useRef } from 'react'
import SnakeSettings from './SnakeSettings'

interface Position {
  x: number
  y: number
}

interface SnakeGameConfig {
  gridSize: number
  cellSize: number
  gameSpeed: number
  boundariesEnabled: boolean
}

const DEFAULT_CONFIG: SnakeGameConfig = {
  gridSize: 20,
  cellSize: 20,
  gameSpeed: 150,
  boundariesEnabled: true,
}

export default function SnakeGame() {
  const [config, setConfig] = useState<SnakeGameConfig>(DEFAULT_CONFIG)
  const [showSettings, setShowSettings] = useState(false)
  
  // Use refs for game state to avoid unnecessary re-renders
  const gameStateRef = useRef({
    snake: [] as Position[],
    food: { x: 15, y: 15 } as Position,
    direction: { x: 1, y: 0 } as Position,
    gameOver: false,
    score: 0,
    isPaused: false,
  })

  const directionRef = useRef({ x: 1, y: 0 })
  const lastMoveTimeRef = useRef(0)
  const animationFrameRef = useRef<number>()

  // State for UI updates only
  const [, forceUpdate] = useState(0)
  const triggerUpdate = () => forceUpdate((prev) => prev + 1)

  // Initialize snake position based on grid size
  const getInitialSnake = useCallback((gridSize: number): Position[] => {
    const center = Math.floor(gridSize / 2)
    return [{ x: center, y: center }]
  }, [])

  const generateFood = useCallback((gridSize: number, snake: Position[]): Position => {
    const emptyCells: Position[] = []
    
    // Find all empty cells
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const isSnakeCell = snake.some((segment) => segment.x === x && segment.y === y)
        if (!isSnakeCell) {
          emptyCells.push({ x, y })
        }
      }
    }

    // If no empty cells, return a default position (shouldn't happen in normal gameplay)
    if (emptyCells.length === 0) {
      return { x: 0, y: 0 }
    }

    // Return random empty cell
    return emptyCells[Math.floor(Math.random() * emptyCells.length)]
  }, [])

  const initializeGame = useCallback(() => {
    const initialSnake = getInitialSnake(config.gridSize)
    const initialFood = generateFood(config.gridSize, initialSnake)
    
    gameStateRef.current = {
      snake: initialSnake,
      food: initialFood,
      direction: { x: 1, y: 0 },
      gameOver: false,
      score: 0,
      isPaused: false,
    }
    
    directionRef.current = { x: 1, y: 0 }
    lastMoveTimeRef.current = 0
    triggerUpdate()
  }, [config.gridSize, getInitialSnake, generateFood])

  useEffect(() => {
    initializeGame()
  }, [initializeGame, config.gridSize, config.boundariesEnabled])

  const checkCollision = useCallback(
    (head: Position, snake: Position[], boundariesEnabled: boolean, gridSize: number): boolean => {
      // Check wall collision (only if boundaries enabled)
      if (boundariesEnabled) {
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
          return true
        }
      }

      // Check self collision
      return snake.some((segment, index) => {
        if (index === 0) return false
        return segment.x === head.x && segment.y === head.y
      })
    },
    []
  )

  const moveSnake = useCallback(() => {
    const state = gameStateRef.current
    if (state.gameOver || state.isPaused) return

    const newHead: Position = {
      x: state.snake[0].x + directionRef.current.x,
      y: state.snake[0].y + directionRef.current.y,
    }

    // Handle wrapping if boundaries disabled
    if (!config.boundariesEnabled) {
      if (newHead.x < 0) {
        newHead.x = config.gridSize - 1
      } else if (newHead.x >= config.gridSize) {
        newHead.x = 0
      }
      if (newHead.y < 0) {
        newHead.y = config.gridSize - 1
      } else if (newHead.y >= config.gridSize) {
        newHead.y = 0
      }
    }

    // Check collision
    if (checkCollision(newHead, state.snake, config.boundariesEnabled, config.gridSize)) {
      state.gameOver = true
      triggerUpdate()
      return
    }

    const newSnake = [newHead, ...state.snake]

    // Check if food is eaten
    if (newHead.x === state.food.x && newHead.y === state.food.y) {
      state.snake = newSnake
      state.score += 10
      state.food = generateFood(config.gridSize, newSnake)
      triggerUpdate()
    } else {
      // Remove tail if no food eaten
      newSnake.pop()
      state.snake = newSnake
    }
  }, [config, checkCollision, generateFood])

  // Game loop using requestAnimationFrame
  useEffect(() => {
    const gameLoop = (currentTime: number) => {
      const state = gameStateRef.current
      
      if (!state.gameOver && !state.isPaused) {
        // Move snake at configured interval
        if (currentTime - lastMoveTimeRef.current >= config.gameSpeed) {
          moveSnake()
          lastMoveTimeRef.current = currentTime
        }
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    lastMoveTimeRef.current = performance.now()
    animationFrameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [config.gameSpeed, config.boundariesEnabled, config.gridSize, moveSnake])

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      // Prevent default behavior for arrow keys to stop scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }

      const state = gameStateRef.current
      if (state.gameOver) return

      switch (e.key) {
        case 'ArrowUp':
          // Prevent reversing into itself (can't go up if currently going down)
          if (directionRef.current.y === 0 && state.snake.length > 0) {
            directionRef.current = { x: 0, y: -1 }
            state.direction = { x: 0, y: -1 }
          }
          break
        case 'ArrowDown':
          // Prevent reversing into itself (can't go down if currently going up)
          if (directionRef.current.y === 0 && state.snake.length > 0) {
            directionRef.current = { x: 0, y: 1 }
            state.direction = { x: 0, y: 1 }
          }
          break
        case 'ArrowLeft':
          // Prevent reversing into itself (can't go left if currently going right)
          if (directionRef.current.x === 0 && state.snake.length > 0) {
            directionRef.current = { x: -1, y: 0 }
            state.direction = { x: -1, y: 0 }
          }
          break
        case 'ArrowRight':
          // Prevent reversing into itself (can't go right if currently going left)
          if (directionRef.current.x === 0 && state.snake.length > 0) {
            directionRef.current = { x: 1, y: 0 }
            state.direction = { x: 1, y: 0 }
          }
          break
        case ' ':
          state.isPaused = !state.isPaused
          triggerUpdate()
          break
      }
    },
    []
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  const resetGame = () => {
    initializeGame()
  }

  const handleConfigChange = (newConfig: SnakeGameConfig) => {
    setConfig(newConfig)
    // Game will reset automatically via useEffect when config changes
  }

  // Calculate game area size (exact pixel size needed for all cells)
  const gameAreaSize = config.gridSize * config.cellSize
  // Border width: 4px on each side = 8px total
  const borderWidth = 8
  // Total container size including border
  const containerSize = gameAreaSize + borderWidth

  const currentState = gameStateRef.current

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
            <SnakeSettings config={config} onConfigChange={handleConfigChange} />
          </div>
        )}
      </div>

      {/* Game Info */}
      <div className="mb-4 flex items-center justify-between w-full max-w-2xl">
        <div className="text-white">
          <div className="text-2xl font-bold">Score: {currentState.score}</div>
          {currentState.gameOver && <div className="text-red-400 font-semibold">Game Over!</div>}
          {currentState.isPaused && !currentState.gameOver && (
            <div className="text-yellow-400 font-semibold">Paused</div>
          )}
          {!currentState.gameOver && !currentState.isPaused && (
            <div className="text-white/60 text-sm mt-1">
              Speed: {config.gameSpeed}ms | Grid: {config.gridSize}x{config.gridSize} |{' '}
              {config.boundariesEnabled ? 'Walls' : 'Wrapping'} | Length: {currentState.snake.length}
            </div>
          )}
        </div>
        <button onClick={resetGame} className="btn-primary">
          {currentState.gameOver ? 'Play Again' : 'Reset'}
        </button>
      </div>

      {/* Game Board */}
      <div
        className="bg-black rounded-lg border-4 border-white/20 relative overflow-hidden mx-auto"
        style={{
          width: `${containerSize}px`,
          height: `${containerSize}px`,
          maxWidth: 'min(100%, calc(100vw - 2rem))',
          maxHeight: 'min(80vh, calc(100vh - 400px))',
          boxSizing: 'border-box',
        }}
      >
        {/* Inner container for game cells - exactly gameAreaSize to fit all cells */}
        <div
          className="relative"
          style={{
            width: `${gameAreaSize}px`,
            height: `${gameAreaSize}px`,
          }}
        >
          {/* Snake */}
          {currentState.snake.map((segment, index) => (
            <div
              key={`snake-${index}-${segment.x}-${segment.y}`}
              className={`absolute rounded transition-all duration-75 ${
                index === 0 ? 'bg-green-500 z-10' : 'bg-green-400'
              }`}
              style={{
                left: segment.x * config.cellSize,
                top: segment.y * config.cellSize,
                width: config.cellSize,
                height: config.cellSize,
              }}
            />
          ))}

          {/* Food */}
          {!currentState.gameOver && (
            <div
              className="absolute bg-red-500 rounded-full z-20 animate-pulse"
              style={{
                left: currentState.food.x * config.cellSize,
                top: currentState.food.y * config.cellSize,
                width: config.cellSize,
                height: config.cellSize,
              }}
            />
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-white/60 text-sm text-center max-w-2xl">
        <p>Use arrow keys to move. Press Space to pause.</p>
        <p className="mt-1">
          {config.boundariesEnabled
            ? 'Hit the walls and you lose!'
            : 'Snake wraps around the edges!'}
        </p>
      </div>
    </div>
  )
}
