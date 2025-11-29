import { useState, useEffect, useCallback, useRef } from 'react'

interface Position {
  x: number
  y: number
}

const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SNAKE: Position[] = [{ x: 10, y: 10 }]
const INITIAL_DIRECTION = { x: 1, y: 0 }
const GAME_SPEED = 150

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE)
  const [food, setFood] = useState<Position>({ x: 15, y: 15 })
  const [direction, setDirection] = useState<Position>(INITIAL_DIRECTION)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const directionRef = useRef(INITIAL_DIRECTION)

  const generateFood = useCallback((): Position => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }
  }, [])

  const checkCollision = useCallback((head: Position, snake: Position[]): boolean => {
    // Check wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true
    }
    // Check self collision
    return snake.some((segment, index) => {
      if (index === 0) return false
      return segment.x === head.x && segment.y === head.y
    })
  }, [])

  const gameLoop = useCallback(() => {
    if (gameOver || isPaused) return

    setSnake((prevSnake) => {
      const newHead: Position = {
        x: prevSnake[0].x + directionRef.current.x,
        y: prevSnake[0].y + directionRef.current.y,
      }

      if (checkCollision(newHead, prevSnake)) {
        setGameOver(true)
        return prevSnake
      }

      const newSnake = [newHead, ...prevSnake]

      // Check if food is eaten
      if (newHead.x === food.x && newHead.y === food.y) {
        setFood(generateFood())
        setScore((prev) => prev + 10)
        return newSnake
      }

      // Remove tail if no food eaten
      newSnake.pop()
      return newSnake
    })
  }, [food, gameOver, isPaused, checkCollision, generateFood])

  useEffect(() => {
    const interval = setInterval(gameLoop, GAME_SPEED)
    return () => clearInterval(interval)
  }, [gameLoop])

  useEffect(() => {
    directionRef.current = direction
  }, [direction])

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
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
        e.preventDefault()
        setIsPaused((prev) => !prev)
        break
    }
  }, [gameOver])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  const resetGame = () => {
    setSnake(INITIAL_SNAKE)
    setFood(generateFood())
    setDirection(INITIAL_DIRECTION)
    directionRef.current = INITIAL_DIRECTION
    setGameOver(false)
    setScore(0)
    setIsPaused(false)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex items-center justify-between w-full max-w-md">
        <div className="text-white">
          <div className="text-2xl font-bold">Score: {score}</div>
          {gameOver && <div className="text-red-400 font-semibold">Game Over!</div>}
          {isPaused && !gameOver && <div className="text-yellow-400 font-semibold">Paused</div>}
        </div>
        <button onClick={resetGame} className="btn-primary">
          {gameOver ? 'Play Again' : 'Reset'}
        </button>
      </div>

      <div
        className="bg-black rounded-lg border-4 border-white/20 relative"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
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
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
            }}
          />
        ))}

        {/* Food */}
        <div
          className="absolute bg-red-500 rounded-full"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
          }}
        />
      </div>

      <div className="mt-4 text-white/60 text-sm text-center max-w-md">
        <p>Use arrow keys to move. Press Space to pause.</p>
      </div>
    </div>
  )
}

