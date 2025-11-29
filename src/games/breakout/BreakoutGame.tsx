import { useState, useEffect, useCallback, useRef } from 'react'
import BreakoutSettings from './BreakoutSettings'

interface Brick {
  x: number
  y: number
  width: number
  height: number
  color: string
  destroyed: boolean
  powerUp?: 'expand' | 'shrink' | 'slow' | 'fast' | 'multiball'
}

interface Ball {
  x: number
  y: number
  dx: number
  dy: number
  radius: number
}

interface PowerUp {
  x: number
  y: number
  type: 'expand' | 'shrink' | 'slow' | 'fast' | 'multiball'
  active: boolean
}

interface BreakoutGameConfig {
  paddleWidth: number
  ballSpeed: number
  paddleSpeed: number
}

const DEFAULT_CONFIG: BreakoutGameConfig = {
  paddleWidth: 100,
  ballSpeed: 300,
  paddleSpeed: 400,
}

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const PADDLE_HEIGHT = 15
const BALL_RADIUS = 8
const BRICK_ROWS = 5
const BRICK_COLS = 10
const BRICK_WIDTH = 70
const BRICK_HEIGHT = 25
const BRICK_PADDING = 5
const BRICK_OFFSET_TOP = 50
const BRICK_OFFSET_LEFT = (CANVAS_WIDTH - (BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING) - BRICK_PADDING)) / 2

const BRICK_COLORS = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500']

export default function BreakoutGame() {
  const [config, setConfig] = useState<BreakoutGameConfig>(DEFAULT_CONFIG)
  const [showSettings, setShowSettings] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  const gameStateRef = useRef({
    paddleX: CANVAS_WIDTH / 2 - DEFAULT_CONFIG.paddleWidth / 2,
    balls: [] as Ball[],
    bricks: [] as Brick[],
    powerUps: [] as PowerUp[],
    score: 0,
    lives: 3,
    level: 1,
    gameOver: false,
    gameStarted: false,
    isPaused: false,
    paddleWidth: DEFAULT_CONFIG.paddleWidth,
    ballSpeed: DEFAULT_CONFIG.ballSpeed,
    activePowerUps: {
      expand: false,
      shrink: false,
      slow: false,
      fast: false,
    },
    powerUpTimers: {} as { [key: string]: ReturnType<typeof setTimeout> },
  })

  const keysRef = useRef<Set<string>>(new Set())
  const [, forceUpdate] = useState(0)
  const triggerUpdate = () => forceUpdate((prev) => prev + 1)

  const initializeBricks = useCallback((): Brick[] => {
    const bricks: Brick[] = []
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        bricks.push({
          x: BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING),
          y: BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING),
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          color: BRICK_COLORS[row % BRICK_COLORS.length],
          destroyed: false,
          powerUp: Math.random() < 0.1 ? (['expand', 'shrink', 'slow', 'fast', 'multiball'][Math.floor(Math.random() * 5)] as Brick['powerUp']) : undefined,
        })
      }
    }
    return bricks
  }, [])

  const resetBall = useCallback((x?: number, y?: number) => {
    const startX = x ?? CANVAS_WIDTH / 2
    const startY = y ?? CANVAS_HEIGHT - 100
    const angle = (Math.random() - 0.5) * Math.PI / 3
    const speed = gameStateRef.current.ballSpeed

    return {
      x: startX,
      y: startY,
      dx: speed * Math.cos(angle),
      dy: -speed * Math.sin(angle),
      radius: BALL_RADIUS,
    }
  }, [])

  const initializeGame = useCallback(() => {
    gameStateRef.current.bricks = initializeBricks()
    gameStateRef.current.balls = [resetBall()]
    gameStateRef.current.powerUps = []
    gameStateRef.current.paddleX = CANVAS_WIDTH / 2 - gameStateRef.current.paddleWidth / 2
    gameStateRef.current.score = 0
    gameStateRef.current.lives = 3
    gameStateRef.current.level = 1
    gameStateRef.current.gameOver = false
    gameStateRef.current.gameStarted = false
    gameStateRef.current.isPaused = false
    gameStateRef.current.paddleWidth = config.paddleWidth
    gameStateRef.current.ballSpeed = config.ballSpeed
    gameStateRef.current.activePowerUps = {
      expand: false,
      shrink: false,
      slow: false,
      fast: false,
    }
    triggerUpdate()
  }, [initializeBricks, resetBall, config])

  useEffect(() => {
    initializeGame()
  }, [initializeGame, config.paddleWidth, config.ballSpeed])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault()
    }
    keysRef.current.add(e.key)
  }, [])

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysRef.current.delete(e.key)
    if (e.key === ' ') {
      e.preventDefault()
      const state = gameStateRef.current
      if (state.gameStarted) {
        state.isPaused = !state.isPaused
      } else {
        state.gameStarted = true
        state.isPaused = false
      }
      triggerUpdate()
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gameLoop = (currentTime: number) => {
      const state = gameStateRef.current
      const deltaTime = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1)
      lastTimeRef.current = currentTime

      if (state.gameStarted && !state.isPaused && !state.gameOver) {
        // Update paddle
        const paddleSpeed = config.paddleSpeed * deltaTime
        if (keysRef.current.has('ArrowLeft') || keysRef.current.has('a') || keysRef.current.has('A')) {
          state.paddleX = Math.max(0, state.paddleX - paddleSpeed)
        }
        if (keysRef.current.has('ArrowRight') || keysRef.current.has('d') || keysRef.current.has('D')) {
          state.paddleX = Math.min(CANVAS_WIDTH - state.paddleWidth, state.paddleX + paddleSpeed)
        }

        // Update balls
        state.balls = state.balls.filter((ball) => {
          ball.x += ball.dx * deltaTime
          ball.y += ball.dy * deltaTime

          // Wall collisions
          if (ball.x <= ball.radius || ball.x >= CANVAS_WIDTH - ball.radius) {
            ball.dx = -ball.dx
            ball.x = Math.max(ball.radius, Math.min(CANVAS_WIDTH - ball.radius, ball.x))
          }
          if (ball.y <= ball.radius) {
            ball.dy = -ball.dy
            ball.y = ball.radius
          }

          // Paddle collision
          if (
            ball.y + ball.radius >= CANVAS_HEIGHT - PADDLE_HEIGHT &&
            ball.y - ball.radius < CANVAS_HEIGHT &&
            ball.x >= state.paddleX &&
            ball.x <= state.paddleX + state.paddleWidth &&
            ball.dy > 0
          ) {
            const hitPos = (ball.x - state.paddleX) / state.paddleWidth
            const angle = (hitPos - 0.5) * Math.PI / 3
            const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy)
            ball.dx = speed * Math.sin(angle)
            ball.dy = -speed * Math.cos(angle)
            ball.y = CANVAS_HEIGHT - PADDLE_HEIGHT - ball.radius
          }

          // Brick collisions
          for (const brick of state.bricks) {
            if (brick.destroyed) continue

            if (
              ball.x + ball.radius >= brick.x &&
              ball.x - ball.radius <= brick.x + brick.width &&
              ball.y + ball.radius >= brick.y &&
              ball.y - ball.radius <= brick.y + brick.height
            ) {
              brick.destroyed = true
              state.score += 10

              // Spawn power-up
              if (brick.powerUp) {
                state.powerUps.push({
                  x: brick.x + brick.width / 2,
                  y: brick.y + brick.height,
                  type: brick.powerUp,
                  active: false,
                })
              }

              // Bounce ball
              const ballCenterX = ball.x
              const ballCenterY = ball.y
              const brickCenterX = brick.x + brick.width / 2
              const brickCenterY = brick.y + brick.height / 2

              const dx = ballCenterX - brickCenterX
              const dy = ballCenterY - brickCenterY

              if (Math.abs(dx) > Math.abs(dy)) {
                ball.dx = -ball.dx
              } else {
                ball.dy = -ball.dy
              }

              break
            }
          }

          // Check if ball fell
          if (ball.y > CANVAS_HEIGHT) {
            return false // Remove ball
          }

          return true
        })

        // Update power-ups
        state.powerUps = state.powerUps.filter((powerUp) => {
          powerUp.y += 150 * deltaTime

          // Paddle collision
          if (
            powerUp.y >= CANVAS_HEIGHT - PADDLE_HEIGHT &&
            powerUp.x >= state.paddleX &&
            powerUp.x <= state.paddleX + state.paddleWidth
          ) {
            // Activate power-up
            if (powerUp.type === 'expand') {
              state.paddleWidth = Math.min(200, state.paddleWidth + 20)
              state.activePowerUps.expand = true
              if (state.powerUpTimers.expand) clearTimeout(state.powerUpTimers.expand)
              state.powerUpTimers.expand = setTimeout(() => {
                state.paddleWidth = config.paddleWidth
                state.activePowerUps.expand = false
              }, 10000)
            } else if (powerUp.type === 'shrink') {
              state.paddleWidth = Math.max(50, state.paddleWidth - 20)
              state.activePowerUps.shrink = true
              if (state.powerUpTimers.shrink) clearTimeout(state.powerUpTimers.shrink)
              state.powerUpTimers.shrink = setTimeout(() => {
                state.paddleWidth = config.paddleWidth
                state.activePowerUps.shrink = false
              }, 10000)
            } else if (powerUp.type === 'slow') {
              state.balls.forEach((ball) => {
                ball.dx *= 0.7
                ball.dy *= 0.7
              })
              state.activePowerUps.slow = true
              if (state.powerUpTimers.slow) clearTimeout(state.powerUpTimers.slow)
              state.powerUpTimers.slow = setTimeout(() => {
                state.balls.forEach((ball) => {
                  ball.dx /= 0.7
                  ball.dy /= 0.7
                })
                state.activePowerUps.slow = false
              }, 10000)
            } else if (powerUp.type === 'fast') {
              state.balls.forEach((ball) => {
                ball.dx *= 1.3
                ball.dy *= 1.3
              })
              state.activePowerUps.fast = true
              if (state.powerUpTimers.fast) clearTimeout(state.powerUpTimers.fast)
              state.powerUpTimers.fast = setTimeout(() => {
                state.balls.forEach((ball) => {
                  ball.dx /= 1.3
                  ball.dy /= 1.3
                })
                state.activePowerUps.fast = false
              }, 10000)
            } else if (powerUp.type === 'multiball') {
              const newBalls = state.balls.map((ball) => ({
                ...resetBall(ball.x, ball.y),
                dx: ball.dx * (Math.random() > 0.5 ? 1 : -1),
                dy: -Math.abs(ball.dy),
              }))
              state.balls.push(...newBalls)
            }
            return false
          }

          return powerUp.y < CANVAS_HEIGHT
        })

        // Check if all balls lost
        if (state.balls.length === 0) {
          state.lives--
          if (state.lives <= 0) {
            state.gameOver = true
          } else {
            state.balls = [resetBall()]
          }
        }

        // Check if all bricks destroyed
        if (state.bricks.every((b) => b.destroyed)) {
          state.level++
          state.bricks = initializeBricks()
          state.balls = [resetBall()]
          state.powerUps = []
        }

        triggerUpdate()
      }

      // Render
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw bricks
      const colorMap: { [key: string]: string } = {
        'bg-red-500': '#ef4444',
        'bg-orange-500': '#f97316',
        'bg-yellow-500': '#eab308',
        'bg-green-500': '#22c55e',
        'bg-blue-500': '#3b82f6',
      }
      state.bricks.forEach((brick) => {
        if (!brick.destroyed) {
          ctx.fillStyle = colorMap[brick.color] || '#ffffff'
          ctx.fillRect(brick.x, brick.y, brick.width, brick.height)
          ctx.strokeStyle = '#ffffff'
          ctx.strokeRect(brick.x, brick.y, brick.width, brick.height)
        }
      })

      // Draw paddle
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(state.paddleX, CANVAS_HEIGHT - PADDLE_HEIGHT, state.paddleWidth, PADDLE_HEIGHT)

      // Draw balls
      ctx.fillStyle = '#ffffff'
      state.balls.forEach((ball) => {
        ctx.beginPath()
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw power-ups
      state.powerUps.forEach((powerUp) => {
        ctx.fillStyle = '#00ff00'
        ctx.beginPath()
        ctx.arc(powerUp.x, powerUp.y, 10, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw UI
      ctx.fillStyle = '#ffffff'
      ctx.font = '20px Arial'
      ctx.fillText(`Score: ${state.score}`, 10, 30)
      ctx.fillText(`Lives: ${state.lives}`, 10, 60)
      ctx.fillText(`Level: ${state.level}`, 10, 90)

      if (!state.gameStarted) {
        ctx.font = '24px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Press SPACE to start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
        ctx.textAlign = 'left'
      } else if (state.isPaused) {
        ctx.font = '24px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
        ctx.textAlign = 'left'
      } else if (state.gameOver) {
        ctx.font = '32px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
        ctx.textAlign = 'left'
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    lastTimeRef.current = performance.now()
    animationFrameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [config, initializeBricks, resetBall])

  const handleConfigChange = (newConfig: BreakoutGameConfig) => {
    setConfig(newConfig)
    initializeGame()
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
            <BreakoutSettings config={config} onConfigChange={handleConfigChange} />
          </div>
        )}
      </div>

      {/* Game Canvas */}
      <div className="bg-black rounded-lg border-4 border-white/20 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block"
        />
      </div>

      {/* Instructions */}
      <div className="mt-4 text-white/60 text-sm text-center max-w-2xl">
        <p>Use ←→ Arrow Keys or A/D to move paddle. Press SPACE to pause.</p>
        <p className="mt-1">Break all bricks to advance to the next level!</p>
      </div>
    </div>
  )
}

