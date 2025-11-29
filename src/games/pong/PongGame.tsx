import { useState, useEffect, useCallback, useRef } from 'react'
import PongSettings from './PongSettings'

interface Ball {
  x: number
  y: number
  dx: number
  dy: number
}

interface PongGameConfig {
  ballSpeed: number
  paddleSize: number
  aiDifficulty: number
}

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 400
const PADDLE_WIDTH = 10
const PADDLE_SPEED = 200 // pixels per second
const BALL_SIZE = 10
const TARGET_FPS = 60
const FRAME_TIME = 1000 / TARGET_FPS

const DEFAULT_CONFIG: PongGameConfig = {
  ballSpeed: 350, // pixels per second
  paddleSize: 80,
  aiDifficulty: 0.8,
}

export default function PongGame() {
  const [config, setConfig] = useState<PongGameConfig>(DEFAULT_CONFIG)
  const [showSettings, setShowSettings] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  
  // Use refs for game state to avoid re-renders
  const gameStateRef = useRef({
    playerY: CANVAS_HEIGHT / 2 - DEFAULT_CONFIG.paddleSize / 2,
    aiY: CANVAS_HEIGHT / 2 - DEFAULT_CONFIG.paddleSize / 2,
    ball: {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      dx: 0,
      dy: 0,
    } as Ball,
    playerScore: 0,
    aiScore: 0,
    isPaused: false,
    gameStarted: false,
    waitingForReset: false,
  })

  // State for UI updates only
  const [, forceUpdate] = useState(0)
  const triggerUpdate = () => forceUpdate((prev) => prev + 1)

  const keysRef = useRef<Set<string>>(new Set())

  const resetBall = useCallback(() => {
    const direction = Math.random() > 0.5 ? 1 : -1
    const angle = (Math.random() - 0.5) * Math.PI / 3 // Random angle between -60 and 60 degrees
    // Store velocity in pixels per second, will be multiplied by deltaTime in game loop
    gameStateRef.current.ball = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      dx: direction * config.ballSpeed * Math.cos(angle),
      dy: config.ballSpeed * Math.sin(angle),
    }
    gameStateRef.current.waitingForReset = false
  }, [config.ballSpeed])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
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

  // Main game loop using requestAnimationFrame
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gameLoop = (currentTime: number) => {
      const state = gameStateRef.current
      
      // Calculate delta time
      const deltaTime = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1) // Cap at 100ms
      lastTimeRef.current = currentTime

      if (state.gameStarted && !state.isPaused && !state.waitingForReset) {
        const paddleSpeed = (PADDLE_SPEED * deltaTime)

        // Update player paddle
        if (keysRef.current.has('ArrowUp') || keysRef.current.has('w') || keysRef.current.has('W')) {
          state.playerY = Math.max(0, state.playerY - paddleSpeed)
        }
        if (keysRef.current.has('ArrowDown') || keysRef.current.has('s') || keysRef.current.has('S')) {
          state.playerY = Math.min(CANVAS_HEIGHT - config.paddleSize, state.playerY + paddleSpeed)
        }

        // Update ball position (ball.dx and ball.dy are in pixels per second)
        const ball = state.ball
        ball.x += ball.dx * deltaTime
        ball.y += ball.dy * deltaTime

        // Ball collision with top/bottom walls
        if (ball.y <= 0) {
          ball.dy = Math.abs(ball.dy)
          ball.y = 0
        } else if (ball.y >= CANVAS_HEIGHT - BALL_SIZE) {
          ball.dy = -Math.abs(ball.dy)
          ball.y = CANVAS_HEIGHT - BALL_SIZE
        }

        // Ball collision with player paddle (left side)
        if (
          ball.x <= PADDLE_WIDTH + BALL_SIZE &&
          ball.x >= 0 &&
          ball.y + BALL_SIZE >= state.playerY &&
          ball.y <= state.playerY + config.paddleSize &&
          ball.dx < 0
        ) {
          ball.dx = Math.abs(ball.dx)
          ball.x = PADDLE_WIDTH + BALL_SIZE
          // Add spin based on where ball hits paddle
          const hitPos = (ball.y + BALL_SIZE / 2 - state.playerY) / config.paddleSize
          const maxAngle = Math.PI / 3 // 60 degrees
          const angle = (hitPos - 0.5) * maxAngle
          // Maintain ball speed
          const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy)
          ball.dx = currentSpeed * Math.cos(angle)
          ball.dy = currentSpeed * Math.sin(angle)
        }

        // Ball collision with AI paddle (right side)
        if (
          ball.x >= CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE &&
          ball.x <= CANVAS_WIDTH &&
          ball.y + BALL_SIZE >= state.aiY &&
          ball.y <= state.aiY + config.paddleSize &&
          ball.dx > 0
        ) {
          ball.dx = -Math.abs(ball.dx)
          ball.x = CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE
          // Add spin based on where ball hits paddle
          const hitPos = (ball.y + BALL_SIZE / 2 - state.aiY) / config.paddleSize
          const maxAngle = Math.PI / 3 // 60 degrees
          const angle = Math.PI - (hitPos - 0.5) * maxAngle
          // Maintain ball speed
          const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy)
          ball.dx = currentSpeed * Math.cos(angle)
          ball.dy = currentSpeed * Math.sin(angle)
        }

        // Score points
        if (ball.x < -BALL_SIZE) {
          state.aiScore++
          state.waitingForReset = true
          triggerUpdate()
          setTimeout(() => {
            resetBall()
            triggerUpdate()
          }, 500)
        } else if (ball.x > CANVAS_WIDTH + BALL_SIZE) {
          state.playerScore++
          state.waitingForReset = true
          triggerUpdate()
          setTimeout(() => {
            resetBall()
            triggerUpdate()
          }, 500)
        }

        // AI - follow ball with difficulty-based speed
        const targetY = ball.y + BALL_SIZE / 2 - config.paddleSize / 2
        const diff = targetY - state.aiY
        const aiSpeed = PADDLE_SPEED * config.aiDifficulty * deltaTime
        state.aiY += Math.sign(diff) * Math.min(Math.abs(diff), aiSpeed)
        state.aiY = Math.max(0, Math.min(CANVAS_HEIGHT - config.paddleSize, state.aiY))
      }

      // Render
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw center line
      ctx.strokeStyle = '#ffffff'
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(CANVAS_WIDTH / 2, 0)
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT)
      ctx.stroke()
      ctx.setLineDash([])

      // Draw paddles
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, state.playerY, PADDLE_WIDTH, config.paddleSize)
      ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, state.aiY, PADDLE_WIDTH, config.paddleSize)

      // Draw ball
      if (!state.waitingForReset) {
        ctx.fillRect(state.ball.x, state.ball.y, BALL_SIZE, BALL_SIZE)
      }

      // Draw scores
      ctx.fillStyle = '#ffffff'
      ctx.font = '48px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(state.playerScore.toString(), CANVAS_WIDTH / 4, 50)
      ctx.fillText(state.aiScore.toString(), (3 * CANVAS_WIDTH) / 4, 50)

      // Draw pause/start message
      if (!state.gameStarted) {
        ctx.font = '24px Arial'
        ctx.fillText('Press SPACE to start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
      } else if (state.isPaused) {
        ctx.font = '24px Arial'
        ctx.fillText('PAUSED - Press SPACE to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
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
  }, [config, resetBall])

  // Initialize ball on mount
  useEffect(() => {
    resetBall()
  }, [resetBall])

  useEffect(() => {
    gameStateRef.current.playerY = CANVAS_HEIGHT / 2 - config.paddleSize / 2
    gameStateRef.current.aiY = CANVAS_HEIGHT / 2 - config.paddleSize / 2
    resetBall()
  }, [config.paddleSize, resetBall])

  const resetGame = () => {
    const state = gameStateRef.current
    state.playerScore = 0
    state.aiScore = 0
    state.gameStarted = false
    state.isPaused = false
    state.waitingForReset = false
    state.playerY = CANVAS_HEIGHT / 2 - config.paddleSize / 2
    state.aiY = CANVAS_HEIGHT / 2 - config.paddleSize / 2
    resetBall()
    triggerUpdate()
  }

  const handleConfigChange = (newConfig: PongGameConfig) => {
    setConfig(newConfig)
    resetGame()
  }

  // Get current state for display
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
            <PongSettings config={config} onConfigChange={handleConfigChange} />
          </div>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between w-full max-w-2xl">
        <div className="text-white">
          <div className="text-lg font-semibold">
            Player: {currentState.playerScore} | AI: {currentState.aiScore}
          </div>
        </div>
        <button onClick={resetGame} className="btn-primary">
          Reset
        </button>
      </div>

      <div className="bg-black rounded-lg border-4 border-white/20 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block"
        />
      </div>

      <div className="mt-4 text-white/60 text-sm text-center max-w-2xl">
        <p>Use ↑↓ Arrow Keys or W/S to move your paddle. Press SPACE to pause.</p>
      </div>
    </div>
  )
}
