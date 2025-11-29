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
  const [snake, setSnake] = useState<Position[]>([])
  const [food, setFood] = useState<Position>({ x: 15, y: 15 })
  const [direction, setDirection] = useState<Position>({ x: 1, y: 0 })
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const directionRef = useRef({ x: 1, y: 0 })
  const gameSpeedRef = useRef(config.gameSpeed)

  // Initialize snake position based on grid size
  const getInitialSnake = useCallback((gridSize: number): Position[] => {
    const center = Math.floor(gridSize / 2)
    return [{ x: center, y: center }]
  }, [])

  const generateFood = useCallback((gridSize: number): Position => {
    return {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    }
  }, [])

  // Initialize game
  useEffect(() => {
    const initialSnake = getInitialSnake(config.gridSize)
    setSnake(initialSnake)
    setFood(generateFood(config.gridSize))
    setDirection({ x: 1, y: 0 })
    directionRef.current = { x: 1, y: 0 }
    setGameOver(false)
    setScore(0)
    setIsPaused(false)
  }, [config.gridSize, getInitialSnake, generateFood])

  // Update game speed ref when config changes
  useEffect(() => {
    gameSpeedRef.current = config.gameSpeed
  }, [config.gameSpeed])

  const checkCollision = useCallback(
    (head: Position, snake: Position[], boundariesEnabled: boolean, gridSize: number): boolean => {
      // Check wall collision (only if boundaries enabled)
      if (boundariesEnabled) {
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
          return true
        }
      }
      // Note: Wrapping is handled in gameLoop before calling checkCollision

      // Check self collision
      return snake.some((segment, index) => {
        if (index === 0) return false
        return segment.x === head.x && segment.y === head.y
      })
    },
    []
  )

  const gameLoop = useCallback(() => {
    if (gameOver || isPaused) return

    setSnake((prevSnake) => {
      const newHead: Position = {
        x: prevSnake[0].x + directionRef.current.x,
        y: prevSnake[0].y + directionRef.current.y,
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

      if (checkCollision(newHead, prevSnake, config.boundariesEnabled, config.gridSize)) {
        setGameOver(true)
        return prevSnake
      }

      const newSnake = [newHead, ...prevSnake]

      // Check if food is eaten
      if (newHead.x === food.x && newHead.y === food.y) {
        let newFood = generateFood(config.gridSize)
        // Make sure food doesn't spawn on snake
        while (newSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)) {
          newFood = generateFood(config.gridSize)
        }
        setFood(newFood)
        setScore((prev) => prev + 10)
        return newSnake
      }

      // Remove tail if no food eaten
      newSnake.pop()
      return newSnake
    })
  }, [food, gameOver, isPaused, config, checkCollision, generateFood])

  useEffect(() => {
    const interval = setInterval(gameLoop, gameSpeedRef.current)
    return () => clearInterval(interval)
  }, [gameLoop])

  useEffect(() => {
    directionRef.current = direction
  }, [direction])

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      // Prevent default behavior for arrow keys to stop scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }

      if (gameOver) return

      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current.y === 0) {
            setDirection({ x: 0, y: -1 })
          }
          break
        case 'ArrowDown':
          if (directionRef.current.y === 0) {
            setDirection({ x: 0, y: 1 })
          }
          break
        case 'ArrowLeft':
          if (directionRef.current.x === 0) {
            setDirection({ x: -1, y: 0 })
          }
          break
        case 'ArrowRight':
          if (directionRef.current.x === 0) {
            setDirection({ x: 1, y: 0 })
          }
          break
        case ' ':
          setIsPaused((prev) => !prev)
          break
      }
    },
    [gameOver]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  const resetGame = () => {
    const initialSnake = getInitialSnake(config.gridSize)
    setSnake(initialSnake)
    setFood(generateFood(config.gridSize))
    setDirection({ x: 1, y: 0 })
    directionRef.current = { x: 1, y: 0 }
    setGameOver(false)
    setScore(0)
    setIsPaused(false)
  }

  const handleConfigChange = (newConfig: SnakeGameConfig) => {
    setConfig(newConfig)
    resetGame()
  }

  // Calculate game area size (exact pixel size needed for all cells)
  const gameAreaSize = config.gridSize * config.cellSize
  // Border width: 4px on each side = 8px total
  const borderWidth = 8
  // Total container size including border
  const containerSize = gameAreaSize + borderWidth

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
          <div className="text-2xl font-bold">Score: {score}</div>
          {gameOver && <div className="text-red-400 font-semibold">Game Over!</div>}
          {isPaused && !gameOver && <div className="text-yellow-400 font-semibold">Paused</div>}
          {!gameOver && !isPaused && (
            <div className="text-white/60 text-sm mt-1">
              Speed: {config.gameSpeed}ms | Grid: {config.gridSize}x{config.gridSize} |{' '}
              {config.boundariesEnabled ? 'Walls' : 'Wrapping'}
            </div>
          )}
        </div>
        <button onClick={resetGame} className="btn-primary">
          {gameOver ? 'Play Again' : 'Reset'}
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
          {snake.map((segment, index) => (
            <div
              key={index}
              className={`absolute rounded ${
                index === 0 ? 'bg-green-500' : 'bg-green-400'
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
          <div
            className="absolute bg-red-500 rounded-full"
            style={{
              left: food.x * config.cellSize,
              top: food.y * config.cellSize,
              width: config.cellSize,
              height: config.cellSize,
            }}
          />
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
